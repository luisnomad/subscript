// Email sync command handlers

use crate::db::{get_db_connection, DatabaseType};
use crate::utils::{get_current_timestamp, AppResult};
use crate::services::sync::SyncService;
use rusqlite::OptionalExtension;

#[tauri::command]
pub async fn trigger_email_sync(test_mode: bool) -> AppResult<String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;

    let now = get_current_timestamp();

    // Create sync log entry
    conn.execute(
        "INSERT INTO sync_log (sync_started_at, status, created_at) VALUES (?1, 'running', ?2)",
        rusqlite::params![now.clone(), now.clone()],
    )?;
    let log_id = conn.last_insert_rowid();

    // Run sync
    match SyncService::run_sync(test_mode).await {
        Ok(_) => {
            let completed_at = get_current_timestamp();
            conn.execute(
                "UPDATE sync_log SET sync_completed_at = ?1, status = 'completed' WHERE id = ?2",
                rusqlite::params![completed_at, log_id],
            )?;
            Ok("Email sync completed successfully".to_string())
        }
        Err(e) => {
            let error_msg = e.to_string();
            conn.execute(
                "UPDATE sync_log SET status = 'failed', error_message = ?1 WHERE id = ?2",
                rusqlite::params![error_msg, log_id],
            )?;
            Err(e)
        }
    }
}

#[tauri::command]
pub fn get_last_sync_time(test_mode: bool) -> AppResult<Option<String>> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;

    let last_sync = conn
        .query_row(
            "SELECT sync_completed_at FROM sync_log WHERE status = 'completed' ORDER BY sync_completed_at DESC LIMIT 1",
            [],
            |row| row.get(0),
        )
        .optional()?;

    Ok(last_sync)
}
