use std::process::Command;
use crate::utils::AppResult;

pub struct MarkItDownService;

impl MarkItDownService {
    pub fn convert_to_markdown(file_path: &str) -> AppResult<String> {
        // Execute markitdown via python subprocess
        let output = Command::new("python3")
            .arg("-m")
            .arg("markitdown")
            .arg(file_path)
            .output()
            .map_err(|e| crate::utils::AppError::Internal(format!("Failed to execute markitdown: {}", e)))?;

        if !output.status.success() {
            let error = String::from_utf8_lossy(&output.stderr);
            return Err(crate::utils::AppError::Internal(format!("MarkItDown failed: {}", error)));
        }

        let markdown = String::from_utf8_lossy(&output.stdout).to_string();
        Ok(markdown)
    }
}
