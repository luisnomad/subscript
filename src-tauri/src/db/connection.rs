// Database connection management
// Handles database path resolution and connection creation

use rusqlite::Connection;
use std::path::PathBuf;
use anyhow::Result;

#[derive(Debug, Clone, Copy)]
pub enum DatabaseType {
    Production,
    Test,
}

/// Get the database file path based on type
pub fn get_db_path(db_type: DatabaseType) -> Result<PathBuf> {
    let app_dir = dirs::data_local_dir()
        .ok_or_else(|| anyhow::anyhow!("Could not find app data directory"))?
        .join("subscript");

    // Create directory if it doesn't exist
    std::fs::create_dir_all(&app_dir)?;

    let db_name = match db_type {
        DatabaseType::Production => "subscript.db",
        DatabaseType::Test => "subscript_test.db",
    };

    Ok(app_dir.join(db_name))
}

/// Get a database connection
pub fn get_db_connection(db_type: DatabaseType) -> Result<Connection> {
    let db_path = get_db_path(db_type)?;
    let conn = Connection::open(db_path)?;

    // Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON", [])?;

    Ok(conn)
}
