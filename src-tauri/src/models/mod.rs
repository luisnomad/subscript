// Data models
// This module contains all data structures used throughout the application

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Subscription {
    pub id: Option<i64>,
    pub name: String,
    pub cost: f64,
    pub currency: String,
    #[serde(rename = "billingCycle")]
    pub periodicity: String, // "monthly", "yearly", "one-time"
    #[serde(rename = "nextBillingDate")]
    pub next_date: Option<String>,
    pub category: Option<String>,
    pub status: String, // "active", "paused", "cancelled"
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubscriptionExtraction {
    pub name: String,
    pub cost: f64,
    pub currency: String,
    #[serde(rename = "billingCycle")]
    pub periodicity: String,
    #[serde(rename = "nextBillingDate")]
    pub next_date: Option<String>,
    pub category: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DomainExtraction {
    #[serde(rename = "domainName")]
    pub name: String,
    pub registrar: Option<String>,
    pub cost: Option<f64>,
    pub currency: Option<String>,
    #[serde(rename = "registrationDate")]
    pub registration_date: Option<String>,
    #[serde(rename = "expiryDate")]
    pub expiry_date: String,
    #[serde(rename = "autoRenew")]
    pub auto_renew: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Domain {
    pub id: Option<i64>,
    #[serde(rename = "domainName")]
    pub name: String,
    pub registrar: Option<String>,
    pub cost: Option<f64>,
    pub currency: Option<String>,
    #[serde(rename = "registrationDate")]
    pub registration_date: Option<String>,
    #[serde(rename = "expiryDate")]
    pub expiry_date: String,
    #[serde(rename = "autoRenew")]
    pub auto_renew: bool,
    pub status: String, // "active", "expired", "pending-renewal"
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PendingImport {
    pub id: Option<i64>,
    pub email_subject: Option<String>,
    pub email_from: String,
    pub email_date: Option<String>,
    pub classification: Option<String>, // "subscription", "domain", "junk"
    pub confidence: Option<f64>, // 0.0 to 1.0
    pub extracted_data: String, // JSON string
    pub receipt_id: Option<i64>,
    pub status: String, // "pending", "approved", "rejected"
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Receipt {
    pub id: Option<i64>,
    pub subscription_id: Option<i64>,
    pub domain_id: Option<i64>,
    pub email_subject: Option<String>,
    pub email_from: Option<String>,
    pub email_date: String,
    #[serde(rename = "attachmentMimeType")]
    pub file_type: Option<String>,
    #[serde(rename = "attachmentData")]
    pub file_data: Option<String>, // Base64 encoded
    pub raw_email_body: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EmailContent {
    pub subject: String,
    pub from: String,
    pub date: String,
    pub body: String,
    pub attachments: Vec<Attachment>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Attachment {
    pub filename: String,
    pub content_type: String,
    pub data: Vec<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub imap_server: String,
    pub imap_port: i32,
    pub imap_username: String,
    pub imap_use_ssl: bool,
    pub ollama_endpoint: String,
    pub ollama_model: String,
    pub default_currency: String,
    pub sync_interval_minutes: i32,
    pub theme: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncLog {
    pub id: Option<i64>,
    pub sync_started_at: String,
    pub sync_completed_at: Option<String>,
    pub emails_processed: i32,
    pub emails_imported: i32,
    pub status: String, // "running", "completed", "failed"
    pub error_message: Option<String>,
    pub created_at: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_subscription_serialization() {
        let sub = Subscription {
            id: Some(1),
            name: "Netflix".to_string(),
            cost: 15.99,
            currency: "USD".to_string(),
            periodicity: "monthly".to_string(),
            next_date: Some("2024-01-01".to_string()),
            category: Some("Entertainment".to_string()),
            status: "active".to_string(),
            notes: None,
            created_at: "2023-12-01T10:00:00Z".to_string(),
            updated_at: "2023-12-01T10:00:00Z".to_string(),
        };

        let serialized = serde_json::to_value(&sub).unwrap();
        assert_eq!(serialized["id"], 1);
        assert_eq!(serialized["name"], "Netflix");
        assert_eq!(serialized["cost"], 15.99);
        assert_eq!(serialized["currency"], "USD");
        assert_eq!(serialized["billingCycle"], "monthly");
        assert_eq!(serialized["nextBillingDate"], "2024-01-01");
    }

    #[test]
    fn test_domain_serialization() {
        let domain = Domain {
            id: Some(1),
            name: "example.com".to_string(),
            registrar: Some("Namecheap".to_string()),
            cost: Some(10.0),
            currency: Some("USD".to_string()),
            registration_date: Some("2023-01-01".to_string()),
            expiry_date: "2024-01-01".to_string(),
            auto_renew: true,
            status: "active".to_string(),
            notes: None,
            created_at: "2023-01-01T10:00:00Z".to_string(),
            updated_at: "2023-01-01T10:00:00Z".to_string(),
        };

        let serialized = serde_json::to_value(&domain).unwrap();
        assert_eq!(serialized["id"], 1);
        assert_eq!(serialized["domainName"], "example.com");
        assert_eq!(serialized["cost"], 10.0);
        assert_eq!(serialized["expiryDate"], "2024-01-01");
        assert_eq!(serialized["autoRenew"], true);
    }

    #[test]
    fn test_pending_import_serialization() {
        let import = PendingImport {
            id: Some(1),
            email_subject: Some("Receipt".to_string()),
            email_from: "info@netflix.com".to_string(),
            email_date: Some("2024-01-01".to_string()),
            classification: Some("subscription".to_string()),
            confidence: Some(0.95),
            extracted_data: "{}".to_string(),
            receipt_id: None,
            status: "pending".to_string(),
            created_at: "2024-01-01T10:00:00Z".to_string(),
        };

        let serialized = serde_json::to_value(&import).unwrap();
        assert_eq!(serialized["id"], 1);
        assert_eq!(serialized["emailSubject"], "Receipt");
        assert_eq!(serialized["emailFrom"], "info@netflix.com");
        assert_eq!(serialized["confidence"], 0.95);
    }
}
