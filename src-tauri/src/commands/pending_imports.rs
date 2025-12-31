// Pending import command handlers

use crate::db::{get_db_connection, DatabaseType};
use crate::models::{PendingImport, Subscription, Domain, SubscriptionExtraction, DomainExtraction};
use crate::utils::{get_current_timestamp, AppResult};
use rusqlite::OptionalExtension;

#[tauri::command]
pub fn get_pending_imports(test_mode: bool) -> AppResult<Vec<PendingImport>> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;

    let mut stmt = conn
        .prepare("SELECT id, email_subject, email_from, email_date, classification, confidence, extracted_data, receipt_id, status, created_at FROM pending_imports WHERE status = 'pending' ORDER BY created_at DESC")?;

    let imports = stmt
        .query_map([], |row| {
            let extracted_data: String = row.get(6)?;
            println!("Fetched pending import with extracted_data: {}", extracted_data);
            Ok(PendingImport {
                id: Some(row.get(0)?),
                email_subject: row.get(1)?,
                email_from: row.get(2)?,
                email_date: row.get(3)?,
                classification: row.get(4)?,
                confidence: row.get(5)?,
                extracted_data,
                receipt_id: row.get(7)?,
                status: row.get(8)?,
                created_at: row.get(9)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

    println!("Found {} pending imports", imports.len());
    Ok(imports)
}

#[tauri::command]
pub fn approve_pending_import(
    id: i64,
    edited_data: Option<String>,
    test_mode: bool,
) -> AppResult<()> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;

    // Fetch the pending import
    let pending_import: PendingImport = conn
        .query_row(
            "SELECT id, email_subject, email_from, email_date, classification, confidence, extracted_data, receipt_id, status, created_at FROM pending_imports WHERE id = ?1",
            [id],
            |row| {
                Ok(PendingImport {
                    id: Some(row.get(0)?),
                    email_subject: row.get(1)?,
                    email_from: row.get(2)?,
                    email_date: row.get(3)?,
                    classification: row.get(4)?,
                    confidence: row.get(5)?,
                    extracted_data: row.get(6)?,
                    receipt_id: row.get(7)?,
                    status: row.get(8)?,
                    created_at: row.get(9)?,
                })
            },
        )?;

    // Use edited data if provided, otherwise use extracted data
    let data_to_use = edited_data.unwrap_or(pending_import.extracted_data);

    // Parse the JSON data based on classification
    let created_id = match pending_import.classification.as_deref() {
        Some("subscription") => {
            let extraction: SubscriptionExtraction = serde_json::from_str(&data_to_use)?;
            create_subscription_from_import(extraction, &conn)?
        }
        Some("domain") => {
            let extraction: DomainExtraction = serde_json::from_str(&data_to_use)?;
            create_domain_from_import(extraction, &conn)?
        }
        _ => {
            return Err(crate::utils::error::AppError::Validation(
                "Invalid classification or junk email".to_string(),
            ));
        }
    };

    // Link receipt if exists
    if let Some(receipt_id) = pending_import.receipt_id {
        match pending_import.classification.as_deref() {
            Some("subscription") => {
                conn.execute(
                    "UPDATE receipts SET subscription_id = ?1 WHERE id = ?2",
                    [created_id, receipt_id],
                )?;
            }
            Some("domain") => {
                conn.execute(
                    "UPDATE receipts SET domain_id = ?1 WHERE id = ?2",
                    [created_id, receipt_id],
                )?;
            }
            _ => {}
        }
    }

    // Mark as approved
    conn.execute(
        "UPDATE pending_imports SET status = 'approved' WHERE id = ?1",
        [id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn reject_pending_import(id: i64, test_mode: bool) -> AppResult<()> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;

    conn.execute(
        "UPDATE pending_imports SET status = 'rejected' WHERE id = ?1",
        [id],
    )?;

    Ok(())
}

#[tauri::command]
pub fn batch_approve_pending_imports(ids: Vec<i64>, test_mode: bool) -> AppResult<()> {
    for id in ids {
        approve_pending_import(id, None, test_mode)?;
    }
    Ok(())
}

#[tauri::command]
pub fn batch_reject_pending_imports(ids: Vec<i64>, test_mode: bool) -> AppResult<()> {
    for id in ids {
        reject_pending_import(id, test_mode)?;
    }
    Ok(())
}

// Helper function to create subscription from import
fn create_subscription_from_import(
    extraction: SubscriptionExtraction,
    conn: &rusqlite::Connection,
) -> AppResult<i64> {
    let now = get_current_timestamp();

    conn.execute(
        "INSERT INTO subscriptions (name, amount, currency, periodicity, next_date, category, status, notes, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            extraction.name,
            extraction.amount,
            extraction.currency,
            extraction.periodicity,
            extraction.next_date,
            extraction.category,
            "active", // Default status
            None::<String>, // No notes from extraction
            now,
            now,
        ],
    )?;

    Ok(conn.last_insert_rowid())
}

// Helper function to create domain from import
fn create_domain_from_import(
    extraction: DomainExtraction,
    conn: &rusqlite::Connection,
) -> AppResult<i64> {
    let now = get_current_timestamp();

    // Check if domain exists
    let existing_id: Option<i64> = conn
        .query_row(
            "SELECT id FROM domains WHERE name = ?1",
            [&extraction.name],
            |row| row.get(0),
        )
        .optional()?;

    if let Some(id) = existing_id {
        // Update existing domain
        conn.execute(
            "UPDATE domains SET 
                registrar = COALESCE(?1, registrar),
                amount = COALESCE(?2, amount),
                currency = COALESCE(?3, currency),
                registration_date = COALESCE(?4, registration_date),
                expiry_date = ?5,
                auto_renew = COALESCE(?6, auto_renew),
                updated_at = ?7
             WHERE id = ?8",
            rusqlite::params![
                extraction.registrar,
                extraction.amount,
                extraction.currency,
                extraction.registration_date,
                extraction.expiry_date,
                extraction.auto_renew.map(|b| if b { 1 } else { 0 }),
                now,
                id
            ],
        )?;
        Ok(id)
    } else {
        // Insert new domain
        conn.execute(
            "INSERT INTO domains (name, registrar, amount, currency, registration_date, expiry_date, auto_renew, status, notes, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            rusqlite::params![
                extraction.name,
                extraction.registrar,
                extraction.amount,
                extraction.currency,
                extraction.registration_date,
                extraction.expiry_date,
                if extraction.auto_renew.unwrap_or(false) {
                    1
                } else {
                    0
                },
                "active",       // Default status
                None::<String>, // No notes from extraction
                now,
                now,
            ],
        )?;

        Ok(conn.last_insert_rowid())
    }
}

// Create a new pending import (for manual/test creation)
#[tauri::command]
pub fn create_pending_import(
    email_subject: String,
    email_from: String,
    email_date: String,
    classification: String,
    extracted_data: String,
    confidence: f64,
    test_mode: bool,
) -> AppResult<i64> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;
    let now = get_current_timestamp();

    // Debug log
    println!("Creating pending import with extracted_data: {}", extracted_data);

    conn.execute(
        "INSERT INTO pending_imports (email_subject, email_from, email_date, classification, confidence, extracted_data, receipt_id, status, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, NULL, 'pending', ?7)",
        rusqlite::params![
            email_subject,
            email_from,
            email_date,
            classification,
            confidence,
            extracted_data,
            now,
        ],
    )?;

    let id = conn.last_insert_rowid();
    println!("Created pending import with id: {}", id);
    
    Ok(id)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::{get_db_connection, DatabaseType, init_database, clear_test_database};

    fn setup_test_db() {
        let conn = get_db_connection(DatabaseType::Test).unwrap();
        init_database(&conn).unwrap();
        clear_test_database(&conn).unwrap();
    }

    #[test]
    fn test_create_and_get_pending_imports() {
        setup_test_db();
        
        let id = create_pending_import(
            "Test Subject".to_string(),
            "test@example.com".to_string(),
            "2024-01-01".to_string(),
            "subscription".to_string(),
            "{\"name\":\"Test\"}".to_string(),
            0.95,
            true
        ).unwrap();

        assert!(id > 0);

        let imports = get_pending_imports(true).unwrap();
        assert_eq!(imports.len(), 1);
        assert_eq!(imports[0].email_subject, Some("Test Subject".to_string()));
        assert_eq!(imports[0].email_from, "test@example.com");
        assert_eq!(imports[0].extracted_data, "{\"name\":\"Test\"}");
    }

    #[test]
    fn test_approve_pending_import() {
        setup_test_db();
        
        let id = create_pending_import(
            "Netflix Receipt".to_string(),
            "info@netflix.com".to_string(),
            "2024-01-01".to_string(),
            "subscription".to_string(),
            "{\"name\":\"Netflix\",\"cost\":15.99,\"currency\":\"USD\",\"billingCycle\":\"monthly\"}".to_string(),
            0.99,
            true
        ).unwrap();

        approve_pending_import(id, None, true).unwrap();

        // Verify it's no longer in pending
        let imports = get_pending_imports(true).unwrap();
        assert_eq!(imports.len(), 0);

        // Verify it's in subscriptions
        let conn = get_db_connection(DatabaseType::Test).unwrap();
        let count: i64 = conn.query_row("SELECT COUNT(*) FROM subscriptions", [], |r| r.get(0)).unwrap();
        assert_eq!(count, 1);
    }

    #[test]
    fn test_reject_pending_import() {
        setup_test_db();
        
        let id = create_pending_import(
            "Spam".to_string(),
            "spam@example.com".to_string(),
            "2024-01-01".to_string(),
            "junk".to_string(),
            "{}".to_string(),
            0.1,
            true
        ).unwrap();

        reject_pending_import(id, true).unwrap();

        let imports = get_pending_imports(true).unwrap();
        assert_eq!(imports.len(), 0);
    }
}
