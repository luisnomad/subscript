// Receipt command handlers

use crate::db::{get_db_connection, DatabaseType};
use crate::models::Receipt;
use anyhow::Result;
use chrono::{Duration, Utc};

#[tauri::command]
pub fn get_receipt_by_id(id: i64, test_mode: bool) -> Result<Receipt, String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;

    let receipt = conn
        .query_row(
            "SELECT id, subscription_id, domain_id, email_subject, email_from, email_date, file_type, file_data, raw_email_body, created_at FROM receipts WHERE id = ?1",
            [id],
            |row| {
                Ok(Receipt {
                    id: Some(row.get(0)?),
                    subscription_id: row.get(1)?,
                    domain_id: row.get(2)?,
                    email_subject: row.get(3)?,
                    email_from: row.get(4)?,
                    email_date: row.get(5)?,
                    file_type: row.get(6)?,
                    file_data: row.get(7)?,
                    raw_email_body: row.get(8)?,
                    created_at: row.get(9)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(receipt)
}

#[tauri::command]
pub fn delete_old_receipts(test_mode: bool) -> Result<usize, String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;

    // Calculate date 1 year ago
    let one_year_ago = Utc::now() - Duration::days(365);
    let cutoff_date = one_year_ago.format("%Y-%m-%d %H:%M:%S").to_string();

    let deleted = conn
        .execute(
            "DELETE FROM receipts WHERE created_at < ?1",
            [cutoff_date],
        )
        .map_err(|e| e.to_string())?;

    Ok(deleted)
}
