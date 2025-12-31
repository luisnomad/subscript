// Utility functions
// This module contains helper functions used throughout the application

pub mod error;

use chrono::{DateTime, Utc};
pub use error::{AppError, AppResult};

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_valid_email() {
        assert!(is_valid_email("test@example.com"));
        assert!(!is_valid_email("invalid-email"));
        assert!(!is_valid_email("test@no-dot"));
    }

    #[test]
    fn test_is_test_email() {
        assert!(is_test_email("Receipt [TEST] for Netflix"));
        assert!(is_test_email("[test] subscription"));
        assert!(!is_test_email("Regular receipt"));
    }
}
