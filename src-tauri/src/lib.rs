// SubScript - Subscription and Domain Tracker
// Backend implementation using Tauri 2.x and Rust

mod commands;
mod db;
mod models;
mod services;
mod utils;

use db::{get_db_connection, init_database, DatabaseType};

// Initialize databases on app startup
fn initialize_databases() -> Result<(), String> {
    // Initialize production database
    let prod_conn = get_db_connection(DatabaseType::Production).map_err(|e| e.to_string())?;
    init_database(&prod_conn).map_err(|e| e.to_string())?;

    // Initialize test database
    let test_conn = get_db_connection(DatabaseType::Test).map_err(|e| e.to_string())?;
    init_database(&test_conn).map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize databases before starting the app
    if let Err(e) = initialize_databases() {
        eprintln!("Failed to initialize databases: {}", e);
        std::process::exit(1);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // Subscription commands
            commands::subscriptions::get_subscriptions,
            commands::subscriptions::get_subscription_by_id,
            commands::subscriptions::create_subscription,
            commands::subscriptions::update_subscription,
            commands::subscriptions::delete_subscription,
            // Domain commands
            commands::domains::get_domains,
            commands::domains::get_domain_by_id,
            commands::domains::create_domain,
            commands::domains::update_domain,
            commands::domains::delete_domain,
            // Pending import commands
            commands::pending_imports::get_pending_imports,
            commands::pending_imports::create_pending_import,
            commands::pending_imports::approve_pending_import,
            commands::pending_imports::reject_pending_import,
            commands::pending_imports::batch_approve_pending_imports,
            commands::pending_imports::batch_reject_pending_imports,
            // Settings commands
            commands::settings::get_settings,
            commands::settings::update_settings,
            commands::settings::get_ollama_models,
            commands::settings::test_imap_connection,
            // Receipt commands
            commands::receipts::get_receipt_by_id,
            commands::receipts::delete_old_receipts,
            // Sync commands
            commands::sync::trigger_email_sync,
            commands::sync::get_last_sync_time,
            // Database management commands
            commands::database::clear_test_db,
            commands::database::export_database,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
