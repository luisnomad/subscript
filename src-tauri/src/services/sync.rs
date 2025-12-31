use crate::db::{get_db_connection, DatabaseType};
use crate::models::EmailContent;
use crate::services::imap::ImapService;
use crate::services::markitdown::MarkItDownService;
use crate::services::ollama::OllamaService;
use crate::utils::{get_current_timestamp, AppResult};
use crate::commands::settings::{get_settings, get_imap_password};
use base64::Engine as _;

pub struct SyncService;

impl SyncService {
    pub async fn run_sync(test_mode: bool) -> AppResult<()> {
        // 1. Get settings
        let settings = get_settings(test_mode)?;
        let password = get_imap_password().unwrap_or_default();

        if settings.imap_server.is_empty() || settings.imap_username.is_empty() || password.is_empty() {
            return Ok(()); // Skip sync if not configured
        }

        // 2. Initialize IMAP service
        let imap_service = ImapService::new(
            settings.imap_server.clone(),
            settings.imap_port as u16,
            settings.imap_username.clone(),
            password,
            settings.imap_use_ssl,
        );

        // 3. Fetch unread emails
        let emails = imap_service.fetch_unread_emails().await?;

        // 4. Initialize Ollama service
        let ollama_service = OllamaService::new(
            settings.ollama_endpoint.clone(),
            settings.ollama_model.clone(),
        );

        // 5. Ensure MarkItDown is ready
        MarkItDownService::ensure_markitdown()?;

        for email in emails {
            if let Err(e) = Self::process_email(email, &ollama_service, test_mode).await {
                eprintln!("Error processing email: {}", e);
            }
        }

        Ok(())
    }

    async fn process_email(
        email: EmailContent,
        ollama_service: &OllamaService,
        test_mode: bool,
    ) -> AppResult<()> {
        // Determine if this is a test email (subject contains [test])
        let is_test_email = email.subject.to_lowercase().contains("[test]");
        
        // Route to appropriate database
        let db_type = if test_mode || is_test_email {
            DatabaseType::Test
        } else {
            DatabaseType::Production
        };

        // 1. Select content to process
        let (markdown, attachment_data, mime_type) = Self::extract_best_content(&email)?;

        // 2. Extract data via Ollama
        let extraction = ollama_service.extract_receipt_data(&markdown).await?;

        // 3. Save receipt
        let conn = get_db_connection(db_type)?;
        let now = get_current_timestamp();

        let receipt_id = if let Some(data) = attachment_data {
            let file_data_base64 = base64::Engine::encode(&base64::engine::general_purpose::STANDARD, &data);
            
            conn.execute(
                "INSERT INTO receipts (email_subject, email_from, email_date, attachment_mime_type, attachment_data, raw_email_body, created_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                rusqlite::params![
                    email.subject,
                    email.from,
                    email.date,
                    mime_type,
                    file_data_base64,
                    email.body,
                    now
                ],
            )?;
            Some(conn.last_insert_rowid())
        } else {
            conn.execute(
                "INSERT INTO receipts (email_subject, email_from, email_date, raw_email_body, created_at)
                 VALUES (?1, ?2, ?3, ?4, ?5)",
                rusqlite::params![
                    email.subject,
                    email.from,
                    email.date,
                    email.body,
                    now
                ],
            )?;
            Some(conn.last_insert_rowid())
        };

        // 4. Save pending import
        conn.execute(
            "INSERT INTO pending_imports (email_subject, email_from, email_date, classification, confidence, extracted_data, receipt_id, status, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            rusqlite::params![
                email.subject,
                email.from,
                email.date,
                extraction.classification,
                extraction.confidence,
                extraction.data.to_string(),
                receipt_id,
                "pending",
                now
            ],
        )?;

        Ok(())
    }

    fn extract_best_content(email: &EmailContent) -> AppResult<(String, Option<Vec<u8>>, Option<String>)> {
        // 1. Look for PDF
        for attachment in &email.attachments {
            if attachment.content_type.to_lowercase().contains("pdf") {
                let markdown = MarkItDownService::convert_data_to_markdown(&attachment.data, ".pdf")?;
                return Ok((markdown, Some(attachment.data.clone()), Some(attachment.content_type.clone())));
            }
        }

        // 2. Look for images
        for attachment in &email.attachments {
            let ct = attachment.content_type.to_lowercase();
            if ct.contains("image/jpeg") || ct.contains("image/png") {
                let ext = if ct.contains("jpeg") { ".jpg" } else { ".png" };
                let markdown = MarkItDownService::convert_data_to_markdown(&attachment.data, ext)?;
                return Ok((markdown, Some(attachment.data.clone()), Some(attachment.content_type.clone())));
            }
        }

        // 3. Use email body
        let markdown = MarkItDownService::convert_data_to_markdown(email.body.as_bytes(), ".html")?;
        Ok((markdown, None, None))
    }
}
