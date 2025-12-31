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
}
