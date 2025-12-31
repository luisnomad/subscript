use crate::utils::AppResult;
use serde::{Deserialize, Serialize};

pub struct OllamaService {
    endpoint: String,
    model: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct OllamaRequest {
    model: String,
    prompt: String,
    stream: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct OllamaResponse {
    response: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaModel {
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct OllamaTagsResponse {
    models: Vec<OllamaModel>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LlmExtractionResult {
    #[serde(rename = "type")]
    pub classification: String,
    pub confidence: f64,
    pub data: serde_json::Value,
}

impl OllamaService {
    pub fn new(endpoint: String, model: String) -> Self {
        Self { endpoint, model }
    }

    pub async fn list_models(endpoint: &str) -> AppResult<Vec<String>> {
        let client = reqwest::Client::new();
        let url = format!("{}/api/tags", endpoint);

        let response = client
            .get(url)
            .send()
            .await
            .map_err(|e| crate::utils::AppError::Internal(format!("Ollama request failed: {}", e)))?;

        let result: OllamaTagsResponse = response
            .json()
            .await
            .map_err(|e| crate::utils::AppError::Internal(format!("Failed to parse Ollama response: {}", e)))?;

        Ok(result.models.into_iter().map(|m| m.name).collect())
    }

    pub async fn generate(&self, prompt: String) -> AppResult<String> {
        let client = reqwest::Client::new();
        let url = format!("{}/api/generate", self.endpoint);

        let request = OllamaRequest {
            model: self.model.clone(),
            prompt,
            stream: false,
        };

        let response = client
            .post(url)
            .json(&request)
            .send()
            .await
            .map_err(|e| crate::utils::AppError::Internal(format!("Ollama request failed: {}", e)))?;

        let result: OllamaResponse = response
            .json()
            .await
            .map_err(|e| crate::utils::AppError::Internal(format!("Failed to parse Ollama response: {}", e)))?;

        Ok(result.response)
    }

    pub async fn extract_receipt_data(&self, markdown_content: &str) -> AppResult<LlmExtractionResult> {
        let prompt = format!(
            r#"You are a receipt and billing document analyzer. Your task is to classify and extract data from receipts.

CLASSIFICATION OPTIONS:
- "subscription": Recurring payment (monthly/yearly service)
- "domain": Domain registration or renewal
- "junk": Spam, promotional email, or irrelevant content

CONFIDENCE: Return a value from 0.0 to 1.0 indicating how confident you are.

EXTRACTION RULES:
- For subscriptions: Extract vendor name, amount, currency, billing cycle (monthly/yearly/one-time), next billing date, and category
- For domains: Extract domain name, registrar, and expiry date
- For junk: Only return type and confidence, no data field
- All dates should be in ISO format (YYYY-MM-DD)
- Currency codes should be 3-letter ISO codes (USD, EUR, GBP, etc.)

Return ONLY valid JSON matching this structure:
{{
  "type": "subscription" | "domain" | "junk",
  "confidence": 0.0-1.0,
  "data": {{
    // For subscriptions:
    "vendor": "string",
    "amount": number,
    "currency": "string",
    "cycle": "monthly" | "yearly" | "one-time",
    "next_billing": "YYYY-MM-DD" (optional),
    "category": "string" (optional)
    
    // For domains:
    "domain_name": "string",
    "registrar": "string" (optional),
    "expiry_date": "YYYY-MM-DD"
  }}
}}

RECEIPT CONTENT:
{}
"#,
            markdown_content
        );

        let response = self.generate(prompt).await?;
        
        // Try to extract JSON from the response (in case the LLM adds extra text)
        let json_start = response.find('{').ok_or_else(|| crate::utils::AppError::Internal("No JSON found in Ollama response".to_string()))?;
        let json_end = response.rfind('}').ok_or_else(|| crate::utils::AppError::Internal("No JSON found in Ollama response".to_string()))?;
        let json_str = &response[json_start..=json_end];

        let result: LlmExtractionResult = serde_json::from_str(json_str)
            .map_err(|e| crate::utils::AppError::Internal(format!("Failed to parse LLM JSON: {}", e)))?;

        Ok(result)
    }
}
