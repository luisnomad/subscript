// Settings command handlers

use crate::db::{get_db_connection, DatabaseType};
use crate::models::AppSettings;
use crate::utils::{get_current_timestamp, AppResult};

#[tauri::command]
pub fn get_settings(test_mode: bool) -> AppResult<AppSettings> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;

    let mut stmt = conn
        .prepare("SELECT key, value FROM settings")?;

    let settings_map: std::collections::HashMap<String, String> = stmt
        .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))?
        .collect::<Result<_, _>>()?;

    let settings = AppSettings {
        imap_server: settings_map.get("imap_server").cloned().unwrap_or_default(),
        imap_port: settings_map
            .get("imap_port")
            .and_then(|s| s.parse().ok())
            .unwrap_or(993),
        imap_username: settings_map
            .get("imap_username")
            .cloned()
            .unwrap_or_default(),
        imap_use_ssl: settings_map
            .get("imap_use_ssl")
            .map(|s| s == "true")
            .unwrap_or(true),
        ollama_endpoint: settings_map
            .get("ollama_endpoint")
            .cloned()
            .unwrap_or_else(|| "http://localhost:11434".to_string()),
        default_currency: settings_map
            .get("default_currency")
            .cloned()
            .unwrap_or_else(|| "USD".to_string()),
        sync_interval_minutes: settings_map
            .get("sync_interval_minutes")
            .and_then(|s| s.parse().ok())
            .unwrap_or(30),
        theme: settings_map
            .get("theme")
            .cloned()
            .unwrap_or_else(|| "light".to_string()),
    };

    Ok(settings)
}

#[tauri::command]
pub fn update_settings(settings: AppSettings, test_mode: bool) -> AppResult<()> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;

    let now = get_current_timestamp();

    // Update each setting
    let settings_to_update = vec![
        ("imap_server", settings.imap_server),
        ("imap_port", settings.imap_port.to_string()),
        ("imap_username", settings.imap_username),
        ("imap_use_ssl", settings.imap_use_ssl.to_string()),
        ("ollama_endpoint", settings.ollama_endpoint),
        ("default_currency", settings.default_currency),
        (
            "sync_interval_minutes",
            settings.sync_interval_minutes.to_string(),
        ),
        ("theme", settings.theme),
    ];

    for (key, value) in settings_to_update {
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?1, ?2, ?3)",
            rusqlite::params![key, value, now],
        )?;
    }

    Ok(())
}

#[tauri::command]
pub fn test_imap_connection(
    _server: String,
    _port: i32,
    _username: String,
    _password: String,
    _use_ssl: bool,
) -> Result<String, String> {
    // Placeholder for IMAP connection test
    // This will be implemented in Phase 3 when IMAP integration is added
    Ok("IMAP connection test not yet implemented".to_string())
}
