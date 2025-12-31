use async_imap::Client;
use tokio::net::TcpStream;
use native_tls::TlsConnector as NativeTlsConnector;
use tokio_native_tls::TlsConnector as TokioTlsConnector;
use crate::utils::{AppResult, AppError};

pub struct ImapService {
    server: String,
    port: u16,
    username: String,
    password: String,
    #[allow(dead_code)]
    use_ssl: bool,
}

impl ImapService {
    pub fn new(
        server: String,
        port: u16,
        username: String,
        password: String,
        use_ssl: bool,
    ) -> Self {
        Self {
            server,
            port,
            username,
            password,
            use_ssl,
        }
    }

    pub async fn test_connection(&self) -> AppResult<()> {
        // 1. Create the TCP connection
        let tcp_stream = TcpStream::connect((self.server.as_str(), self.port))
            .await
            .map_err(|e| AppError::Internal(format!("Failed to connect to IMAP server: {}", e)))?;

        // 2. Set up TLS
        let native_tls_connector = NativeTlsConnector::builder()
            .build()
            .map_err(|e| AppError::Internal(format!("Failed to build TLS connector: {}", e)))?;
        let tokio_tls_connector = TokioTlsConnector::from(native_tls_connector);
        
        let tls_stream = tokio_tls_connector
            .connect(&self.server, tcp_stream)
            .await
            .map_err(|e| AppError::Internal(format!("TLS connection error: {}", e)))?;

        // 3. Create the IMAP client
        let mut client = Client::new(tls_stream);

        // 4. Read the server greeting (REQUIRED for Client::new)
        client.read_response().await.map_err(|e| {
            AppError::Internal(format!("Failed to read server greeting: {}", e))
        })?;

        // 5. Login
        let mut session = client
            .login(&self.username, &self.password)
            .await
            .map_err(|e| AppError::Internal(format!("Failed to login to IMAP server: {}", e.0)))?;

        session.logout().await.map_err(|e| {
            AppError::Internal(format!("Failed to logout from IMAP server: {}", e))
        })?;

        Ok(())
    }

    pub async fn fetch_unread_emails(&self) -> AppResult<Vec<String>> {
        // Placeholder for fetching emails
        Ok(vec![])
    }
}
