// Utility functions
// This module contains helper functions used throughout the application

use chrono::{DateTime, Utc};

/// Get current timestamp in ISO 8601 format
pub fn get_current_timestamp() -> String {
    let now: DateTime<Utc> = Utc::now();
    now.to_rfc3339()
}

/// Validate email address format (basic validation)
pub fn is_valid_email(email: &str) -> bool {
    email.contains('@') && email.contains('.')
}

/// Check if subject contains [test] marker (case-insensitive)
pub fn is_test_email(subject: &str) -> bool {
    subject.to_lowercase().contains("[test]")
}
