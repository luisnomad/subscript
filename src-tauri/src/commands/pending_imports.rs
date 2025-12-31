// Pending import command handlers

use crate::db::{get_db_connection, DatabaseType};
use crate::models::{PendingImport, Subscription, Domain};
use crate::utils::get_current_timestamp;
use anyhow::Result;

#[tauri::command]
pub fn get_pending_imports(test_mode: bool) -> Result<Vec<PendingImport>, String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, email_subject, email_from, email_date, classification, confidence, extracted_data, receipt_id, status, created_at FROM pending_imports WHERE status = 'pending' ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

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
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    println!("Found {} pending imports", imports.len());
    Ok(imports)
}

#[tauri::command]
pub fn approve_pending_import(
    id: i64,
    edited_data: Option<String>,
    test_mode: bool,
) -> Result<(), String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;

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
        )
        .map_err(|e| e.to_string())?;

    // Use edited data if provided, otherwise use extracted data
    let data_to_use = edited_data.unwrap_or(pending_import.extracted_data);

    // Parse the JSON data based on classification
    match pending_import.classification.as_deref() {
        Some("subscription") => {
            let subscription: Subscription =
                serde_json::from_str(&data_to_use).map_err(|e| e.to_string())?;
            create_subscription_from_import(subscription, &conn)?;
        }
        Some("domain") => {
            let domain: Domain = serde_json::from_str(&data_to_use).map_err(|e| e.to_string())?;
            create_domain_from_import(domain, &conn)?;
        }
        _ => {
            return Err("Invalid classification or junk email".to_string());
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
pub fn reject_pending_import(id: i64, test_mode: bool) -> Result<(), String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE pending_imports SET status = 'rejected' WHERE id = ?1",
        [id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn batch_approve_pending_imports(ids: Vec<i64>, test_mode: bool) -> Result<(), String> {
    for id in ids {
        approve_pending_import(id, None, test_mode)?;
    }
    Ok(())
}

#[tauri::command]
pub fn batch_reject_pending_imports(ids: Vec<i64>, test_mode: bool) -> Result<(), String> {
    for id in ids {
        reject_pending_import(id, test_mode)?;
    }
    Ok(())
}

// Helper function to create subscription from import
fn create_subscription_from_import(
    subscription: Subscription,
    conn: &rusqlite::Connection,
) -> Result<i64, String> {
    let now = get_current_timestamp();

    conn.execute(
        "INSERT INTO subscriptions (name, amount, currency, periodicity, next_date, category, status, notes, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            subscription.name,
            subscription.amount,
            subscription.currency,
            subscription.periodicity,
            subscription.next_date,
            subscription.category,
            subscription.status,
            subscription.notes,
            now,
            now,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

// Helper function to create domain from import
fn create_domain_from_import(
    domain: Domain,
    conn: &rusqlite::Connection,
) -> Result<i64, String> {
    let now = get_current_timestamp();

    conn.execute(
        "INSERT INTO domains (name, registrar, amount, currency, registration_date, expiry_date, auto_renew, status, notes, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![
            domain.name,
            domain.registrar,
            domain.amount,
            domain.currency,
            domain.registration_date,
            domain.expiry_date,
            if domain.auto_renew { 1 } else { 0 },
            domain.status,
            domain.notes,
            now,
            now,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
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
) -> Result<i64, String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;
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
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    println!("Created pending import with id: {}", id);
    
    Ok(id)
}
