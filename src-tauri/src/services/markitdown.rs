use std::process::Command;
use std::io::Write;
use crate::utils::AppResult;

pub struct MarkItDownService;

impl MarkItDownService {
    pub fn ensure_markitdown() -> AppResult<()> {
        let output = Command::new("python3")
            .arg("-m")
            .arg("markitdown")
            .arg("--version")
            .output();

        match output {
            Ok(out) if out.status.success() => Ok(()),
            _ => {
                // Try to install it
                let install_output = Command::new("python3")
                    .arg("-m")
                    .arg("pip")
                    .arg("install")
                    .arg("markitdown")
                    .output()
                    .map_err(|e| crate::utils::AppError::Internal(format!("Failed to install markitdown: {}", e)))?;

                if !install_output.status.success() {
                    let error = String::from_utf8_lossy(&install_output.stderr);
                    return Err(crate::utils::AppError::Internal(format!("Failed to install markitdown: {}", error)));
                }
                Ok(())
            }
        }
    }

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

    pub fn convert_data_to_markdown(data: &[u8], extension: &str) -> AppResult<String> {
        let mut temp_file = tempfile::Builder::new()
            .suffix(extension)
            .tempfile()
            .map_err(|e| crate::utils::AppError::Internal(format!("Failed to create temp file: {}", e)))?;

        temp_file.write_all(data).map_err(|e| crate::utils::AppError::Internal(format!("Failed to write to temp file: {}", e)))?;
        
        let path = temp_file.path().to_str().ok_or_else(|| crate::utils::AppError::Internal("Invalid temp file path".to_string()))?;
        
        Self::convert_to_markdown(path)
    }
}
