// Database management command handlers

use crate::db::{clear_test_database, get_db_connection, get_db_path, DatabaseType};
use crate::utils::AppResult;
use std::fs;

#[tauri::command]
pub fn clear_test_db() -> AppResult<()> {
    let conn = get_db_connection(DatabaseType::Test)?;
    clear_test_database(&conn)?;
    Ok(())
}

#[tauri::command]
pub fn export_database(test_mode: bool) -> AppResult<String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let db_path = get_db_path(db_type)?;

    // Get user's downloads directory
    let export_dir = dirs::download_dir()
        .ok_or_else(|| crate::utils::error::AppError::NotFound("Could not find downloads directory".to_string()))?;

    let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
    let export_filename = if test_mode {
        format!("subscript_test_export_{}.db", timestamp)
    } else {
        format!("subscript_export_{}.db", timestamp)
    };

    let export_path = export_dir.join(export_filename);

    // Copy the database file
    fs::copy(&db_path, &export_path)?;

    Ok(export_path.to_string_lossy().to_string())
}
