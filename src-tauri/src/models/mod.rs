// Data models
// This module contains all data structures used throughout the application

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Subscription {
    pub id: Option<i64>,
    pub name: String,
    #[serde(rename = "cost")]
    pub amount: f64,
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
    #[serde(rename = "cost")]
    pub amount: f64,
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
    #[serde(rename = "cost")]
    pub amount: Option<f64>,
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
    #[serde(rename = "cost")]
    pub amount: Option<f64>,
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
