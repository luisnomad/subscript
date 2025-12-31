// Database management command handlers

use crate::db::{clear_test_database, get_db_connection, get_db_path, DatabaseType};
use anyhow::Result;
use std::fs;

#[tauri::command]
pub fn clear_test_db() -> Result<(), String> {
    let conn = get_db_connection(DatabaseType::Test).map_err(|e| e.to_string())?;
    clear_test_database(&conn).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn export_database(test_mode: bool) -> Result<String, String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let db_path = get_db_path(db_type).map_err(|e| e.to_string())?;

    // Get user's downloads directory
    let export_dir = dirs::download_dir()
        .ok_or("Could not find downloads directory")?;

    let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
    let export_filename = if test_mode {
        format!("subscript_test_export_{}.db", timestamp)
    } else {
        format!("subscript_export_{}.db", timestamp)
    };

    let export_path = export_dir.join(export_filename);

    // Copy the database file
    fs::copy(&db_path, &export_path).map_err(|e| e.to_string())?;

    Ok(export_path.to_string_lossy().to_string())
}
