// Database schema initialization
// Contains all SQL statements for creating tables and indexes

use rusqlite::Connection;
use anyhow::Result;

const SCHEMA_VERSION: i32 = 1;

/// Initialize database with complete schema
pub fn init_database(conn: &Connection) -> Result<()> {
    // Create subscriptions table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            cost REAL NOT NULL,
            currency TEXT NOT NULL DEFAULT 'USD',
            periodicity TEXT NOT NULL CHECK(periodicity IN ('monthly', 'yearly', 'one-time')),
            next_date DATE,
            category TEXT DEFAULT 'General',
            status TEXT DEFAULT 'active' CHECK(status IN ('active', 'paused', 'cancelled')),
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_subscriptions_next_date ON subscriptions(next_date)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_subscriptions_periodicity ON subscriptions(periodicity)",
        [],
    )?;

    // Create domains table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS domains (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            registrar TEXT,
            cost REAL,
            currency TEXT DEFAULT 'USD',
            registration_date DATE,
            expiry_date DATE NOT NULL,
            auto_renew INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'pending-renewal')),
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_domains_expiry ON domains(expiry_date)",
        [],
    )?;

    // Create receipts table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS receipts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subscription_id INTEGER,
            domain_id INTEGER,
            email_subject TEXT,
            email_from TEXT,
            email_date DATE NOT NULL,
            file_type TEXT,
            file_data TEXT,
            raw_email_body TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
            FOREIGN KEY(domain_id) REFERENCES domains(id) ON DELETE SET NULL,
            CHECK((subscription_id IS NOT NULL AND domain_id IS NULL) OR
                  (subscription_id IS NULL AND domain_id IS NOT NULL) OR
                  (subscription_id IS NULL AND domain_id IS NULL))
        )",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(email_date)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_receipts_created ON receipts(created_at)",
        [],
    )?;

    // Create pending_imports table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS pending_imports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email_subject TEXT,
            email_from TEXT NOT NULL,
            email_date DATE,
            classification TEXT CHECK(classification IN ('subscription', 'domain', 'junk')),
            confidence REAL CHECK(confidence >= 0.0 AND confidence <= 1.0),
            extracted_data TEXT NOT NULL,
            receipt_id INTEGER,
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(receipt_id) REFERENCES receipts(id) ON DELETE SET NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_pending_status ON pending_imports(status)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_pending_classification ON pending_imports(classification)",
        [],
    )?;

    // Create settings table (key-value store)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Create sync_log table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sync_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sync_started_at DATETIME NOT NULL,
            sync_completed_at DATETIME,
            emails_processed INTEGER DEFAULT 0,
            emails_imported INTEGER DEFAULT 0,
            status TEXT CHECK(status IN ('running', 'completed', 'failed')),
            error_message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Insert default settings if they don't exist
    initialize_default_settings(conn)?;

    // Store schema version
    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_version (
            version INTEGER PRIMARY KEY,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    conn.execute(
        "INSERT OR IGNORE INTO schema_version (version) VALUES (?1)",
        [SCHEMA_VERSION],
    )?;

    Ok(())
}

/// Initialize default application settings
fn initialize_default_settings(conn: &Connection) -> Result<()> {
    let default_settings = vec![
        ("default_currency", "USD"),
        ("imap_server", ""),
        ("imap_port", "993"),
        ("imap_username", ""),
        ("imap_use_ssl", "true"),
        ("sync_interval_minutes", "30"),
        ("ollama_endpoint", "http://localhost:11434"),
        ("ollama_model", "llama3"),
        ("theme", "light"),
    ];

    for (key, value) in default_settings {
        conn.execute(
            "INSERT OR IGNORE INTO settings (key, value) VALUES (?1, ?2)",
            [key, value],
        )?;
    }

    Ok(())
}

/// Clear all data from test database
pub fn clear_test_database(conn: &Connection) -> Result<()> {
    conn.execute("DELETE FROM pending_imports", [])?;
    conn.execute("DELETE FROM receipts", [])?;
    conn.execute("DELETE FROM subscriptions", [])?;
    conn.execute("DELETE FROM domains", [])?;
    conn.execute("DELETE FROM sync_log", [])?;
    Ok(())
}
