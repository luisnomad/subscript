// Database layer
// This module handles all database operations, connection pooling, and schema initialization

pub mod schema;
pub mod connection;

pub use schema::{init_database, clear_test_database};
pub use connection::{get_db_connection, get_db_path, DatabaseType};
