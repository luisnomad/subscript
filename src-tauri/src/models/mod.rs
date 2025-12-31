// Data models
// This module contains all data structures used throughout the application

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Subscription {
    pub id: Option<i64>,
    pub name: String,
    #[serde(alias = "cost")]
    pub amount: f64,
    pub currency: String,
    #[serde(alias = "billingCycle")]
    pub periodicity: String, // "monthly", "yearly", "one-time"
    #[serde(alias = "nextBillingDate")]
    pub next_date: Option<String>,
    pub category: Option<String>,
    pub status: String, // "active", "paused", "cancelled"
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Domain {
    pub id: Option<i64>,
    #[serde(alias = "domainName")]
    pub name: String,
    pub registrar: Option<String>,
    #[serde(alias = "cost")]
    pub amount: Option<f64>,
    pub currency: Option<String>,
    #[serde(alias = "registrationDate")]
    pub registration_date: Option<String>,
    #[serde(alias = "expiryDate")]
    pub expiry_date: String,
    #[serde(alias = "autoRenew")]
    pub auto_renew: bool,
    pub status: String, // "active", "expired", "pending-renewal"
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
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
pub struct Receipt {
    pub id: Option<i64>,
    pub subscription_id: Option<i64>,
    pub domain_id: Option<i64>,
    pub email_subject: Option<String>,
    pub email_from: Option<String>,
    pub email_date: String,
    pub file_type: Option<String>,
    pub file_data: Option<String>, // Base64 encoded
    pub raw_email_body: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub imap_server: String,
    pub imap_port: i32,
    pub imap_username: String,
    pub imap_use_ssl: bool,
    pub ollama_endpoint: String,
    pub default_currency: String,
    pub sync_interval_minutes: i32,
    pub theme: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
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
