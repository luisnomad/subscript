// Email sync command handlers

use crate::db::{get_db_connection, DatabaseType};
use crate::utils::get_current_timestamp;
use anyhow::Result;
use rusqlite::OptionalExtension;

#[tauri::command]
pub fn trigger_email_sync(test_mode: bool) -> Result<String, String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;

    let now = get_current_timestamp();

    // Create sync log entry
    conn.execute(
        "INSERT INTO sync_log (sync_started_at, status, created_at) VALUES (?1, 'running', ?2)",
        rusqlite::params![now.clone(), now],
    )
    .map_err(|e| e.to_string())?;

    // Placeholder for actual email sync logic
    // This will be implemented in Phase 3
    Ok("Email sync triggered (placeholder - not yet implemented)".to_string())
}

#[tauri::command]
pub fn get_last_sync_time(test_mode: bool) -> Result<Option<String>, String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;

    let last_sync = conn
        .query_row(
            "SELECT sync_completed_at FROM sync_log WHERE status = 'completed' ORDER BY sync_completed_at DESC LIMIT 1",
            [],
            |row| row.get(0),
        )
        .optional()
        .map_err(|e| e.to_string())?;

    Ok(last_sync)
}
