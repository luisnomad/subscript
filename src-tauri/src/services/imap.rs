use async_imap::Client;
use tokio::net::TcpStream;
use native_tls::TlsConnector as NativeTlsConnector;
use tokio_native_tls::TlsConnector as TokioTlsConnector;
use crate::utils::{AppResult, AppError};
use crate::models::{EmailContent, Attachment};
use futures::StreamExt;
use mailparse::MailHeaderMap;

pub struct ImapService {
    server: String,
    port: u16,
    username: String,
    password: String,
    #[allow(dead_code)]
    use_ssl: bool,
}

impl ImapService {
    pub fn new(
        server: String,
        port: u16,
        username: String,
        password: String,
        use_ssl: bool,
    ) -> Self {
        Self {
            server,
            port,
            username,
            password,
            use_ssl,
        }
    }

    pub async fn test_connection(&self) -> AppResult<()> {
        // 1. Create the TCP connection
        let tcp_stream = TcpStream::connect((self.server.as_str(), self.port))
            .await
            .map_err(|e| AppError::Internal(format!("Failed to connect to IMAP server: {}", e)))?;

        // 2. Set up TLS
        let native_tls_connector = NativeTlsConnector::builder()
            .build()
            .map_err(|e| AppError::Internal(format!("Failed to build TLS connector: {}", e)))?;
        let tokio_tls_connector = TokioTlsConnector::from(native_tls_connector);
        
        let tls_stream = tokio_tls_connector
            .connect(&self.server, tcp_stream)
            .await
            .map_err(|e| AppError::Internal(format!("TLS connection error: {}", e)))?;

        // 3. Create the IMAP client
        let mut client = Client::new(tls_stream);

        // 4. Read the server greeting (REQUIRED for Client::new)
        client.read_response().await.map_err(|e| {
            AppError::Internal(format!("Failed to read server greeting: {}", e))
        })?;

        // 5. Login
        let mut session = client
            .login(&self.username, &self.password)
            .await
            .map_err(|e| AppError::Internal(format!("Failed to login to IMAP server: {}", e.0)))?;

        session.logout().await.map_err(|e| {
            AppError::Internal(format!("Failed to logout from IMAP server: {}", e))
        })?;

        Ok(())
    }

    pub async fn fetch_unread_emails(&self) -> AppResult<Vec<EmailContent>> {
        // 1. Create the TCP connection
        let tcp_stream = TcpStream::connect((self.server.as_str(), self.port))
            .await
            .map_err(|e| AppError::Internal(format!("Failed to connect to IMAP server: {}", e)))?;

        // 2. Set up TLS
        let native_tls_connector = NativeTlsConnector::builder()
            .build()
            .map_err(|e| AppError::Internal(format!("Failed to build TLS connector: {}", e)))?;
        let tokio_tls_connector = TokioTlsConnector::from(native_tls_connector);
        
        let tls_stream = tokio_tls_connector
            .connect(&self.server, tcp_stream)
            .await
            .map_err(|e| AppError::Internal(format!("TLS connection error: {}", e)))?;

        // 3. Create the IMAP client
        let mut client = Client::new(tls_stream);

        // 4. Read the server greeting
        client.read_response().await.map_err(|e| {
            AppError::Internal(format!("Failed to read server greeting: {}", e))
        })?;

        // 5. Login
        let mut session = client
            .login(&self.username, &self.password)
            .await
            .map_err(|e| AppError::Internal(format!("Failed to login to IMAP server: {}", e.0)))?;

        // 6. Select INBOX
        session.select("INBOX").await.map_err(|e| {
            AppError::Internal(format!("Failed to select INBOX: {}", e))
        })?;

        // 7. Search for unread emails
        let uids = session.uid_search("UNSEEN").await.map_err(|e| {
            AppError::Internal(format!("Failed to search for unread emails: {}", e))
        })?;

        let mut emails = Vec::new();

        for uid in uids {
            let mut fetch = session.uid_fetch(uid.to_string(), "RFC822").await.map_err(|e| {
                AppError::Internal(format!("Failed to fetch email {}: {}", uid, e))
            })?;

            while let Some(msg_res) = fetch.next().await {
                let msg = msg_res.map_err(|e| AppError::Internal(format!("Fetch error: {}", e)))?;
                if let Some(body) = msg.body() {
                    let email_content = self.parse_email(body)?;
                    emails.push(email_content);
                }
            }
        }

        session.logout().await.map_err(|e| {
            AppError::Internal(format!("Failed to logout from IMAP server: {}", e))
        })?;

        Ok(emails)
    }

    fn parse_email(&self, raw_body: &[u8]) -> AppResult<EmailContent> {
        let parsed = mailparse::parse_mail(raw_body).map_err(|e| {
            AppError::Internal(format!("Failed to parse email: {}", e))
        })?;

        let mut subject = String::new();
        let mut from = String::new();
        let mut date = String::new();

        for header in &parsed.headers {
            match header.get_key().to_lowercase().as_str() {
                "subject" => subject = header.get_value(),
                "from" => from = header.get_value(),
                "date" => date = header.get_value(),
                _ => {}
            }
        }

        let mut body = String::new();
        let mut attachments = Vec::new();

        self.extract_parts(&parsed, &mut body, &mut attachments)?;

        Ok(EmailContent {
            subject,
            from,
            date,
            body,
            attachments,
        })
    }

    fn extract_parts(
        &self,
        part: &mailparse::ParsedMail,
        body: &mut String,
        attachments: &mut Vec<Attachment>,
    ) -> AppResult<()> {
        let content_type = part.get_headers().get_first_value("Content-Type").unwrap_or_default();
        let disposition = part.get_headers().get_first_value("Content-Disposition").unwrap_or_default();

        if disposition.contains("attachment") {
            let filename = part
                .get_content_disposition()
                .params
                .get("filename")
                .cloned()
                .unwrap_or_else(|| "unnamed_attachment".to_string());

            attachments.push(Attachment {
                filename,
                content_type,
                data: part.get_body_raw().map_err(|e| {
                    AppError::Internal(format!("Failed to get attachment body: {}", e))
                })?,
            });
        } else if content_type.contains("text/plain") {
            let text = part.get_body().map_err(|e| {
                AppError::Internal(format!("Failed to get email body: {}", e))
            })?;
            body.push_str(&text);
        } else if content_type.contains("text/html") && body.is_empty() {
            // Prefer plain text, but take HTML if no plain text yet
            let html = part.get_body().map_err(|e| {
                AppError::Internal(format!("Failed to get email body: {}", e))
            })?;
            body.push_str(&html);
        }

        for subpart in &part.subparts {
            self.extract_parts(subpart, body, attachments)?;
        }

        Ok(())
    }
}
