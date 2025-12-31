# SubScript v1 - Technical Specification

**Version**: 1.0.0  
**Target Platform**: Desktop (Windows, macOS, Linux)  
**Architecture**: Tauri (Rust Backend + React/TypeScript Frontend)

---

## 1. Executive Summary

SubScript is a local-first subscription and domain tracker with email-based receipt ingestion. Users forward receipts to a dedicated email inbox, and the app automatically extracts subscription/domain data using AI, presenting it for review before adding to the tracking database.

### Key Features (MVP)
- ✅ IMAP email monitoring with 30-minute sync cycle
- ✅ PDF/document receipt processing via MarkItDown
- ✅ AI-powered data extraction using local Ollama
- ✅ Review & confirm workflow with batch operations
- ✅ Manual entry for subscriptions and domains
- ✅ Test mode (emails with `[test]` in subject)
- ✅ One-year receipt archive with auto-cleanup
- ✅ Currency conversion to EUR (configurable)
- ✅ Elegant, distinctive UI (not generic AI aesthetics)

---

## 2. Technology Stack

### Backend (Rust)
- **Framework**: Tauri 2.x
- **Database**: SQLite via `rusqlite`
- **Email**: `imap` + `native-tls` crates
- **Email Parsing**: `mailparse` crate
- **Document Processing**: MarkItDown (Python subprocess)
- **Security**: Tauri's keyring for credential storage

### Frontend (TypeScript/React)
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS 3.x
- **Components**: Shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Context + hooks (or Zustand if needed)
- **Design Philosophy**: Follow Claude's `frontend-design` skill for distinctive, elegant UI

### AI Integration
- **LLM**: Local Ollama instance
- **Supported Models**: llama3.2, mistral, qwen2.5 (user selectable)
- **Communication**: HTTP API via `reqwest` crate

### External Dependencies
- **Python 3.8+**: Required for MarkItDown
- **MarkItDown**: Installed via pip during first run
- **Ollama**: User must have Ollama running locally

---

## 3. Database Schema

### SQLite Tables (Dual Databases: Production & Test)

```sql
-- Production DB: subscript.db
-- Test DB: subscript_test.db

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TABLE subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    periodicity TEXT NOT NULL CHECK(periodicity IN ('monthly', 'yearly', 'one-time')),
    next_date DATE,
    category TEXT DEFAULT 'General',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_next_date ON subscriptions(next_date);
CREATE INDEX idx_subscriptions_periodicity ON subscriptions(periodicity);

-- ============================================
-- DOMAINS
-- ============================================
CREATE TABLE domains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    registrar TEXT,
    expiry_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_domains_expiry ON domains(expiry_date);

-- ============================================
-- RECEIPT ARCHIVE (1 Year Retention)
-- ============================================
CREATE TABLE receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_id INTEGER,
    domain_id INTEGER,
    pdf_path TEXT,
    email_date DATE NOT NULL,
    raw_email_body TEXT,
    source_email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
    FOREIGN KEY(domain_id) REFERENCES domains(id) ON DELETE SET NULL,
    CHECK((subscription_id IS NOT NULL AND domain_id IS NULL) OR 
          (subscription_id IS NULL AND domain_id IS NOT NULL))
);

CREATE INDEX idx_receipts_date ON receipts(email_date);
CREATE INDEX idx_receipts_created ON receipts(created_at);

-- ============================================
-- PENDING IMPORTS (Review Queue)
-- ============================================
CREATE TABLE pending_imports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    raw_body TEXT,
    pdf_path TEXT,
    suggested_json TEXT NOT NULL,
    source_email TEXT NOT NULL,
    email_subject TEXT,
    email_date DATE,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    classification TEXT CHECK(classification IN ('subscription', 'domain', 'junk')),
    confidence REAL CHECK(confidence >= 0.0 AND confidence <= 1.0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pending_status ON pending_imports(status);
CREATE INDEX idx_pending_classification ON pending_imports(classification);

-- ============================================
-- APP SETTINGS
-- ============================================
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Default settings
INSERT INTO settings (key, value) VALUES 
    ('display_currency', 'EUR'),
    ('imap_server', 'outlook.office365.com'),
    ('imap_port', '993'),
    ('imap_username', ''),
    ('sync_interval_minutes', '30'),
    ('ollama_model', 'llama3.2'),
    ('ollama_endpoint', 'http://localhost:11434'),
    ('receipt_retention_days', '365'),
    ('test_mode_enabled', 'false');
```

---

## 4. Data Models (TypeScript)

```typescript
// ============================================
// CORE ENTITIES
// ============================================

export interface Subscription {
  id: number;
  name: string;
  amount: number;
  currency: string;
  periodicity: 'monthly' | 'yearly' | 'one-time';
  next_date: string | null; // ISO date string
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Domain {
  id: number;
  name: string;
  registrar: string | null;
  expiry_date: string; // ISO date string
  created_at: string;
  updated_at: string;
}

export interface Receipt {
  id: number;
  subscription_id: number | null;
  domain_id: number | null;
  pdf_path: string | null;
  email_date: string;
  raw_email_body: string | null;
  source_email: string;
  created_at: string;
}

export interface PendingImport {
  id: number;
  raw_body: string | null;
  pdf_path: string | null;
  suggested_json: string;
  source_email: string;
  email_subject: string | null;
  email_date: string | null;
  status: 'pending' | 'approved' | 'rejected';
  classification: 'subscription' | 'domain' | 'junk' | null;
  confidence: number | null;
  created_at: string;
}

export interface AppSettings {
  display_currency: string;
  imap_server: string;
  imap_port: string;
  imap_username: string;
  sync_interval_minutes: string;
  ollama_model: string;
  ollama_endpoint: string;
  receipt_retention_days: string;
  test_mode_enabled: string;
}

// ============================================
// LLM EXTRACTION MODELS
// ============================================

export interface LLMExtractionResponse {
  type: 'subscription' | 'domain' | 'junk';
  confidence: number; // 0.0 to 1.0
  data?: SubscriptionData | DomainData;
}

export interface SubscriptionData {
  vendor: string;
  amount: number;
  currency: string;
  cycle: 'monthly' | 'yearly' | 'one-time';
  next_billing?: string; // ISO date
  category?: string;
}

export interface DomainData {
  domain_name: string;
  registrar?: string;
  expiry_date: string; // ISO date
}

// ============================================
// UI STATE MODELS
// ============================================

export interface PendingImportWithData extends PendingImport {
  parsedData: LLMExtractionResponse | null;
  isEditing: boolean;
  isSelected: boolean;
}

export interface EmailSyncStatus {
  isRunning: boolean;
  lastSync: string | null;
  nextSync: string | null;
  error: string | null;
}

// ============================================
// FORM MODELS
// ============================================

export interface CreateSubscriptionForm {
  name: string;
  amount: number;
  currency: string;
  periodicity: 'monthly' | 'yearly' | 'one-time';
  next_date: string | null;
  category: string;
}

export interface CreateDomainForm {
  name: string;
  registrar: string;
  expiry_date: string;
}
```

---

## 5. Rust Backend API

### Tauri Commands (Rust → TypeScript Interface)

```rust
// ============================================
// EMAIL SYNC COMMANDS
// ============================================

#[tauri::command]
async fn check_email_now(app_handle: AppHandle) -> Result<SyncResult, String> {
    // Manually trigger email sync
    // Returns: { new_emails: number, errors: string[] }
}

#[tauri::command]
async fn get_sync_status() -> Result<EmailSyncStatus, String> {
    // Get current sync status
}

// ============================================
// PENDING IMPORTS COMMANDS
// ============================================

#[tauri::command]
async fn get_pending_imports(test_mode: bool) -> Result<Vec<PendingImport>, String> {
    // Fetch all pending imports from queue
}

#[tauri::command]
async fn approve_import(import_id: i64, edited_data: Option<String>, test_mode: bool) -> Result<(), String> {
    // Move pending import to subscriptions/domains table
    // If edited_data provided, use that instead of suggested_json
}

#[tauri::command]
async fn reject_import(import_id: i64, test_mode: bool) -> Result<(), String> {
    // Mark import as rejected
}

#[tauri::command]
async fn batch_approve_imports(import_ids: Vec<i64>, test_mode: bool) -> Result<BatchResult, String> {
    // Approve multiple imports at once
}

#[tauri::command]
async fn batch_reject_imports(import_ids: Vec<i64>, test_mode: bool) -> Result<(), String> {
    // Reject multiple imports at once
}

// ============================================
// SUBSCRIPTION COMMANDS
// ============================================

#[tauri::command]
async fn get_subscriptions(test_mode: bool) -> Result<Vec<Subscription>, String> {
    // Fetch all subscriptions
}

#[tauri::command]
async fn create_subscription(data: CreateSubscriptionForm, test_mode: bool) -> Result<Subscription, String> {
    // Manually add a subscription
}

#[tauri::command]
async fn update_subscription(id: i64, data: CreateSubscriptionForm, test_mode: bool) -> Result<(), String> {
    // Update existing subscription
}

#[tauri::command]
async fn delete_subscription(id: i64, test_mode: bool) -> Result<(), String> {
    // Delete subscription
}

// ============================================
// DOMAIN COMMANDS
// ============================================

#[tauri::command]
async fn get_domains(test_mode: bool) -> Result<Vec<Domain>, String> {
    // Fetch all domains
}

#[tauri::command]
async fn create_domain(data: CreateDomainForm, test_mode: bool) -> Result<Domain, String> {
    // Manually add a domain
}

#[tauri::command]
async fn update_domain(id: i64, data: CreateDomainForm, test_mode: bool) -> Result<(), String> {
    // Update existing domain
}

#[tauri::command]
async fn delete_domain(id: i64, test_mode: bool) -> Result<(), String> {
    // Delete domain
}

// ============================================
// SETTINGS COMMANDS
// ============================================

#[tauri::command]
async fn get_settings() -> Result<AppSettings, String> {
    // Get all app settings
}

#[tauri::command]
async fn update_setting(key: String, value: String) -> Result<(), String> {
    // Update a single setting
}

#[tauri::command]
async fn save_imap_password(password: String) -> Result<(), String> {
    // Store IMAP password in Tauri keyring (encrypted)
}

#[tauri::command]
async fn get_imap_password() -> Result<String, String> {
    // Retrieve IMAP password from keyring
}

// ============================================
// UTILITY COMMANDS
// ============================================

#[tauri::command]
async fn get_receipt_file(pdf_path: String) -> Result<Vec<u8>, String> {
    // Return PDF file contents for preview
}

#[tauri::command]
async fn cleanup_old_receipts(test_mode: bool) -> Result<CleanupResult, String> {
    // Delete receipts older than retention period
    // Returns: { deleted_count: number, freed_bytes: number }
}

#[tauri::command]
async fn check_ollama_connection() -> Result<OllamaStatus, String> {
    // Test connection to Ollama and list available models
    // Returns: { is_connected: bool, models: string[] }
}

#[tauri::command]
async fn ensure_markitdown() -> Result<MarkItDownStatus, String> {
    // Check if MarkItDown is installed, install if missing
    // Returns: { installed: bool, version: string }
}
```

---

## 6. Email Processing Pipeline

### 6.1 IMAP Connection Flow

```rust
// Background task runs every 30 minutes (configurable)

async fn email_sync_task() {
    loop {
        // 1. Read settings from DB
        let settings = get_settings().await?;
        let password = get_imap_password().await?;
        
        // 2. Connect to IMAP server
        let client = imap::ClientBuilder::new(&settings.imap_server, settings.imap_port.parse()?)
            .connect()?
            .login(&settings.imap_username, &password)?;
        
        // 3. Select INBOX
        client.select("INBOX")?;
        
        // 4. Search for unread emails
        let unread_uids = client.search("UNSEEN")?;
        
        for uid in unread_uids {
            // 5. Fetch email
            let messages = client.fetch(uid.to_string(), "RFC822")?;
            
            for message in messages.iter() {
                // 6. Parse email
                let parsed = mailparse::parse_mail(message.body()?)?;
                
                // 7. Check for [test] in subject
                let subject = parsed.headers.get_first_value("Subject")?;
                let is_test = subject.contains("[test]");
                
                // 8. Extract attachments or email body
                let content = extract_content(&parsed).await?;
                
                // 9. Convert to markdown via MarkItDown
                let markdown = convert_to_markdown(&content).await?;
                
                // 10. Send to Ollama for extraction
                let llm_response = query_ollama(&markdown, &settings.ollama_model).await?;
                
                // 11. Save to pending_imports
                save_pending_import(
                    &parsed,
                    &content.pdf_path,
                    &llm_response,
                    is_test
                ).await?;
                
                // 12. Mark as read or archive
                client.store(uid.to_string(), "+FLAGS (\\Seen)")?;
            }
        }
        
        // 13. Logout
        client.logout()?;
        
        // 14. Sleep until next sync
        tokio::time::sleep(Duration::from_secs(settings.sync_interval_minutes * 60)).await;
    }
}
```

### 6.2 MarkItDown Integration

```rust
async fn convert_to_markdown(file_path: &str) -> Result<String, String> {
    // Ensure MarkItDown is installed
    ensure_markitdown().await?;
    
    // Call MarkItDown as subprocess
    let output = Command::new("python")
        .args(&["-m", "markitdown", file_path])
        .output()
        .map_err(|e| format!("Failed to run MarkItDown: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("MarkItDown error: {}", String::from_utf8_lossy(&output.stderr)));
    }
    
    String::from_utf8(output.stdout)
        .map_err(|e| format!("Invalid UTF-8 from MarkItDown: {}", e))
}

async fn ensure_markitdown() -> Result<MarkItDownStatus, String> {
    // Check if installed
    let check = Command::new("python")
        .args(&["-m", "markitdown", "--version"])
        .output();
    
    match check {
        Ok(output) if output.status.success() => {
            let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
            Ok(MarkItDownStatus { installed: true, version })
        }
        _ => {
            // Install it
            let install = Command::new("python")
                .args(&["-m", "pip", "install", "markitdown"])
                .output()
                .map_err(|e| format!("Failed to install MarkItDown: {}", e))?;
            
            if !install.status.success() {
                return Err("MarkItDown installation failed".to_string());
            }
            
            Ok(MarkItDownStatus { installed: true, version: "latest".to_string() })
        }
    }
}
```

### 6.3 Ollama LLM Extraction

```rust
async fn query_ollama(markdown_content: &str, model: &str) -> Result<String, String> {
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

JSON OUTPUT:"#,
        markdown_content
    );
    
    let client = reqwest::Client::new();
    let response = client
        .post(format!("{}/api/generate", get_ollama_endpoint()))
        .json(&serde_json::json!({
            "model": model,
            "prompt": prompt,
            "stream": false,
            "format": "json"
        }))
        .send()
        .await
        .map_err(|e| format!("Ollama request failed: {}", e))?;
    
    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Ollama response: {}", e))?;
    
    let llm_output = json["response"]
        .as_str()
        .ok_or("No response from Ollama")?
        .to_string();
    
    // Validate JSON structure
    let _validated: LLMExtractionResponse = serde_json::from_str(&llm_output)
        .map_err(|e| format!("Invalid LLM JSON structure: {}", e))?;
    
    Ok(llm_output)
}
```

### 6.4 Attachment Handling

```rust
async fn extract_content(parsed_email: &ParsedMail) -> Result<EmailContent, String> {
    let mut pdf_path: Option<String> = None;
    let mut body_text: Option<String> = None;
    
    // Check for attachments
    for subpart in &parsed_email.subparts {
        if let Some(content_type) = subpart.headers.get_first_value("Content-Type") {
            // PDF attachment
            if content_type.contains("application/pdf") {
                let filename = extract_filename(&subpart)?;
                let save_path = generate_receipt_path(&filename)?;
                
                // Save PDF to disk
                std::fs::write(&save_path, &subpart.get_body_raw()?)?;
                pdf_path = Some(save_path);
                break; // Prioritize PDF over email body
            }
            
            // DOCX, XLSX, images, etc.
            if content_type.contains("application/") || content_type.contains("image/") {
                let filename = extract_filename(&subpart)?;
                let save_path = generate_receipt_path(&filename)?;
                
                std::fs::write(&save_path, &subpart.get_body_raw()?)?;
                pdf_path = Some(save_path);
                break;
            }
        }
    }
    
    // Fallback to email body if no attachment
    if pdf_path.is_none() {
        body_text = Some(parsed_email.get_body()?);
    }
    
    Ok(EmailContent { pdf_path, body_text })
}

fn generate_receipt_path(filename: &str) -> Result<String, String> {
    let app_data = get_app_data_dir()?;
    let now = chrono::Local::now();
    let year = now.format("%Y").to_string();
    let month = now.format("%m").to_string();
    
    let receipt_dir = format!("{}/receipts/{}/{}", app_data, year, month);
    std::fs::create_dir_all(&receipt_dir)?;
    
    // Generate unique filename with timestamp
    let timestamp = now.timestamp();
    let extension = std::path::Path::new(filename)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("pdf");
    
    Ok(format!("{}/receipt_{}_{}.{}", receipt_dir, timestamp, sanitize_filename(filename), extension))
}
```

---

## 7. Frontend UI Specifications

### 7.1 Design Philosophy (CRITICAL)

**Use the `frontend-design` skill to create an elegant, distinctive interface.**

**Design Principles**:
- ❌ **Avoid**: Generic AI aesthetics (gradients, glassmorphism, purple/blue defaults)
- ✅ **Embrace**: Professional financial dashboard aesthetic with warmth
- ✅ **Typography**: Strong hierarchy, possibly a display font for headings (e.g., Inter for body, Bricolage Grotesque for headers)
- ✅ **Color Palette**:
  - **Primary**: Deep slate or indigo (#334155, #4F46E5) for trust/stability
  - **Accent - Subscriptions**: Emerald (#10B981) for recurring revenue
  - **Accent - Domains**: Amber (#F59E0B) for ownership/assets
  - **Accent - Junk**: Red/gray (#EF4444 / #6B7280)
  - **Surface**: Off-white with subtle texture (#FAFAF9), not stark white
  - **Text**: Rich blacks (#0F172A) and warm grays
- ✅ **Components**:
  - Cards with elegant shadows (not harsh drop-shadows)
  - Smooth transitions and micro-interactions
  - Thoughtful empty states
  - Icon system from Lucide React

### 7.2 Screen Layouts

#### A. Main Layout (App Shell)

```tsx
<AppShell>
  {/* Top Bar */}
  <Header>
    <Logo />
    <TestModeToggle /> {/* Shows current mode: Production / Test */}
    <SyncStatus /> {/* Last sync time + "Check Now" button */}
    <SettingsButton />
  </Header>
  
  {/* Sidebar Navigation */}
  <Sidebar>
    <NavItem icon="inbox" label="Pending" badge={pendingCount} />
    <NavItem icon="credit-card" label="Subscriptions" />
    <NavItem icon="globe" label="Domains" />
    <Separator />
    <NavItem icon="plus-circle" label="Add Manually" />
    <NavItem icon="settings" label="Settings" />
  </Sidebar>
  
  {/* Main Content Area */}
  <MainContent>
    {/* Routed views render here */}
  </MainContent>
</AppShell>
```

#### B. Pending Queue View (MVP PRIORITY)

**Layout**: Masonry grid of pending import cards

```tsx
<PendingQueueView>
  {/* Batch Actions Bar (sticky top) */}
  <BatchActionsBar>
    <SelectAllCheckbox />
    <Button variant="ghost" disabled={selectedCount === 0}>
      Approve Selected ({selectedCount})
    </Button>
    <Button variant="ghost" disabled={selectedCount === 0}>
      Reject Selected ({selectedCount})
    </Button>
  </BatchActionsBar>
  
  {/* Empty State */}
  {pendingImports.length === 0 && (
    <EmptyState
      icon="inbox-check"
      title="All caught up!"
      description="No pending receipts to review. Forward emails to start tracking."
    />
  )}
  
  {/* Import Cards */}
  <CardGrid>
    {pendingImports.map(item => (
      <PendingImportCard
        key={item.id}
        data={item}
        onApprove={handleApprove}
        onReject={handleReject}
        onEdit={handleEdit}
      />
    ))}
  </CardGrid>
</PendingQueueView>
```

**PendingImportCard Component**:

```tsx
<Card className="pending-import-card">
  {/* Header */}
  <CardHeader>
    <Checkbox checked={isSelected} onChange={toggleSelect} />
    
    <ClassificationBadge type={classification} confidence={confidence} />
    {/* e.g., "Subscription • 94% confident" */}
    
    <DropdownMenu>
      <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
      <DropdownMenuItem onClick={viewPDF}>View PDF</DropdownMenuItem>
      <DropdownMenuItem onClick={viewRawEmail}>View Email</DropdownMenuItem>
    </DropdownMenu>
  </CardHeader>
  
  {/* Content - Editable Fields */}
  <CardContent>
    {classification === 'subscription' && (
      <SubscriptionFields data={parsedData} isEditing={isEditing} />
    )}
    
    {classification === 'domain' && (
      <DomainFields data={parsedData} isEditing={isEditing} />
    )}
    
    {classification === 'junk' && (
      <JunkIndicator reason="Promotional email detected" />
    )}
  </CardContent>
  
  {/* Footer Actions */}
  <CardFooter>
    <Button variant="ghost" size="sm" onClick={onReject}>
      <X className="w-4 h-4 mr-2" />
      Reject
    </Button>
    <Button variant="default" size="sm" onClick={onApprove}>
      <Check className="w-4 h-4 mr-2" />
      Approve
    </Button>
  </CardFooter>
</Card>
```

#### C. Manual Entry Forms

**Subscription Form**:
```tsx
<Dialog>
  <DialogTitle>Add Subscription</DialogTitle>
  <DialogContent>
    <Form onSubmit={handleSubmit}>
      <FormField name="name" label="Vendor Name" required />
      <FormField name="amount" label="Amount" type="number" required />
      <FormField name="currency" label="Currency" type="select" options={CURRENCIES} />
      <FormField name="periodicity" label="Billing Cycle" type="select" 
        options={['monthly', 'yearly', 'one-time']} />
      <FormField name="next_date" label="Next Billing Date" type="date" />
      <FormField name="category" label="Category" type="select" 
        options={['Software', 'Entertainment', 'Utilities', 'General']} />
    </Form>
  </DialogContent>
  <DialogFooter>
    <Button variant="ghost" onClick={onCancel}>Cancel</Button>
    <Button type="submit">Add Subscription</Button>
  </DialogFooter>
</Dialog>
```

**Domain Form**:
```tsx
<Dialog>
  <DialogTitle>Add Domain</DialogTitle>
  <DialogContent>
    <Form onSubmit={handleSubmit}>
      <FormField name="name" label="Domain Name" placeholder="example.com" required />
      <FormField name="registrar" label="Registrar" placeholder="Namecheap" />
      <FormField name="expiry_date" label="Expiry Date" type="date" required />
    </Form>
  </DialogContent>
  <DialogFooter>
    <Button variant="ghost" onClick={onCancel}>Cancel</Button>
    <Button type="submit">Add Domain</Button>
  </DialogFooter>
</Dialog>
```

#### D. Settings View

```tsx
<SettingsView>
  {/* Email Configuration */}
  <SettingsSection title="Email Settings">
    <FormField name="imap_username" label="Email Address" type="email" />
    <FormField name="imap_password" label="App Password" type="password" 
      helperText="Create an app-specific password in Outlook settings" />
    <FormField name="sync_interval_minutes" label="Sync Interval" type="number" 
      suffix="minutes" />
    <Button onClick={testConnection}>Test Connection</Button>
  </SettingsSection>
  
  {/* AI Configuration */}
  <SettingsSection title="AI Settings">
    <FormField name="ollama_endpoint" label="Ollama Endpoint" 
      placeholder="http://localhost:11434" />
    <FormField name="ollama_model" label="Model" type="select" 
      options={availableModels} />
    <Button onClick={checkOllamaStatus}>Check Ollama</Button>
  </SettingsSection>
  
  {/* App Configuration */}
  <SettingsSection title="App Settings">
    <FormField name="display_currency" label="Display Currency" type="select" 
      options={CURRENCIES} />
    <FormField name="receipt_retention_days" label="Receipt Retention" 
      type="number" suffix="days" />
    <Button onClick={cleanupOldReceipts}>Clean Up Old Receipts</Button>
  </SettingsSection>
  
  {/* Dependencies */}
  <SettingsSection title="Dependencies">
    <DependencyStatus name="MarkItDown" status={markitdownStatus} />
    <DependencyStatus name="Ollama" status={ollamaStatus} />
    <Button onClick={installDependencies}>Install Missing</Button>
  </SettingsSection>
</SettingsView>
```

### 7.3 Component Specifications

**Key Reusable Components**:

1. **ClassificationBadge**
   - Props: `type`, `confidence`
   - Visual: Pill-shaped badge with icon + text + confidence %
   - Colors: Emerald (subscription), Amber (domain), Red (junk)

2. **CurrencyDisplay**
   - Props: `amount`, `sourceCurrency`, `displayCurrency`
   - Displays converted amount with original in tooltip
   - Example: "€10.99" with tooltip "Originally $12.99 USD"

3. **DateCountdown**
   - Props: `targetDate`, `label`
   - Shows "X days until [label]"
   - Color-coded: Green (>30 days), Amber (7-30 days), Red (<7 days)

4. **PDFPreview**
   - Props: `pdfPath`
   - Shows first page thumbnail
   - Click to open full PDF viewer

5. **SyncStatusIndicator**
   - Props: `lastSync`, `nextSync`, `isRunning`, `error`
   - Visual: Icon + timestamp + spinner when active
   - Shows error state if sync failed

### 7.4 Animations & Interactions

- **Card Hover**: Subtle lift + shadow increase (2px → 8px)
- **Button Clicks**: Scale down (0.98) on press
- **Batch Select**: Checkboxes fade in with stagger
- **Approve/Reject**: Card slides out with fade
- **Loading States**: Skeleton screens for pending data
- **Toasts**: Bottom-right notifications for actions

---

## 8. Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Initialize Tauri project with React + TypeScript template
- [ ] Set up SQLite database with schema (prod + test DBs)
- [ ] Create basic app shell layout (header, sidebar, content area)
- [ ] Implement settings page with form validation
- [ ] Set up Tauri keyring for password storage
- [ ] Create database helper functions (CRUD operations)

### Phase 2: Email Engine (Week 2)
- [ ] Implement IMAP connection service
- [ ] Create email fetch and parse logic (using `mailparse`)
- [ ] Build attachment extraction (PDF, DOCX, etc.)
- [ ] Implement MarkItDown subprocess integration
- [ ] Add `ensure_markitdown()` installation check
- [ ] Create background sync task (30-min interval)
- [ ] Build "Check Now" manual sync command
- [ ] Implement `[test]` subject line detection

### Phase 3: LLM Integration (Week 2)
- [ ] Create Ollama API client (HTTP requests)
- [ ] Design and test extraction prompt
- [ ] Build JSON response parser with validation
- [ ] Implement confidence threshold logic
- [ ] Add error handling for LLM failures
- [ ] Create fallback mechanism (manual review if LLM fails)
- [ ] Build Ollama connection test command

### Phase 4: Review Flow UI (Week 3) **MVP PRIORITY**
- [ ] Design and implement PendingImportCard component
- [ ] Build pending queue grid layout
- [ ] Create editable fields within cards
- [ ] Implement approve/reject logic
- [ ] Build batch selection UI
- [ ] Create batch approve/reject commands
- [ ] Add PDF preview functionality
- [ ] Design empty state for zero pending items
- [ ] Implement sync status indicator in header

### Phase 5: Manual Entry (Week 3)
- [ ] Build "Add Subscription" dialog/form
- [ ] Build "Add Domain" dialog/form
- [ ] Implement form validation
- [ ] Create Tauri commands for manual inserts
- [ ] Add success/error toast notifications

### Phase 6: Data Display (Week 4)
- [ ] Create subscriptions list view
- [ ] Create domains list view
- [ ] Implement edit/delete functionality
- [ ] Build search/filter controls
- [ ] Add sorting options

### Phase 7: Polish & Testing (Week 4)
- [ ] Implement currency conversion display
- [ ] Build receipt cleanup job (delete old files)
- [ ] Create test mode toggle in UI
- [ ] Add comprehensive error handling
- [ ] Design and implement all empty states
- [ ] Performance optimization (lazy loading, pagination)
- [ ] Security audit (credential storage, SQL injection prevention)
- [ ] User testing and bug fixes

### Phase 8: Post-MVP Features (Future)
- [ ] Dashboard view with analytics
- [ ] Monthly burn calculation
- [ ] Upcoming bills widget
- [ ] Domain expiry countdown
- [ ] Export functionality (CSV, JSON)
- [ ] Notifications for upcoming renewals
- [ ] Multi-currency exchange rate API integration
- [ ] Mobile companion app (optional)

---

## 9. Testing Strategy

### Unit Tests (Rust)
- Database operations (CRUD)
- Email parsing logic
- MarkItDown conversion
- Ollama response parsing
- Date calculations (expiry, next billing)

### Integration Tests
- IMAP connection and sync
- End-to-end email → pending import flow
- Batch approval workflow
- Currency conversion accuracy

### UI Tests (Playwright or Vitest)
- Form validation
- Batch selection UX
- Modal interactions
- Settings persistence

### Manual Testing Checklist
- [ ] Forward test email with `[test]` subject
- [ ] Verify PDF extraction and preview
- [ ] Test LLM classification accuracy (10+ receipts)
- [ ] Approve and verify data appears in subscriptions/domains
- [ ] Reject and verify status update
- [ ] Test manual entry forms
- [ ] Verify currency conversion display
- [ ] Test cleanup job (mock old receipts)
- [ ] Test sync interval timing
- [ ] Verify password encryption in keyring

---

## 10. Security Considerations

1. **Credential Storage**: Use Tauri's keyring API, never store passwords in plaintext
2. **SQL Injection**: Use parameterized queries exclusively
3. **File Paths**: Sanitize all filenames, prevent directory traversal
4. **Email Content**: Sanitize HTML before display (use DOMPurify)
5. **LLM Prompts**: Validate and sanitize user-controlled content before sending to Ollama
6. **Local Storage**: Receipts folder should have restrictive permissions
7. **Network**: IMAP connections must use TLS (port 993)

---

## 11. Known Limitations & Future Enhancements

### Current Limitations
- Requires Python 3.8+ for MarkItDown
- Requires local Ollama installation
- Single IMAP account (no multi-account support)
- No mobile app (desktop only)
- No cloud sync (local-first only)

### Future Enhancements
- OCR for scanned receipts (via MarkItDown + Tesseract)
- Email rule automation (auto-approve trusted vendors)
- Budget tracking and spending analytics
- Calendar integration (sync billing dates)
- Browser extension (capture online subscriptions)
- Multi-language support
- Dark mode toggle
- Data export/import (JSON, CSV)

---

## 12. Dependencies Summary

### Rust Crates
```toml
[dependencies]
tauri = "2.x"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
rusqlite = { version = "0.32", features = ["bundled"] }
imap = "2.4"
native-tls = "0.2"
mailparse = "0.15"
reqwest = { version = "0.12", features = ["json"] }
tokio = { version = "1.40", features = ["full"] }
chrono = { version = "0.4", features = ["serde"] }
anyhow = "1.0"
```

### NPM Packages
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tauri-apps/api": "^2.0.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-checkbox": "^1.0.0",
    "lucide-react": "^0.400.0",
    "date-fns": "^3.0.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.51.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

### External Dependencies
- **Python 3.8+**: System requirement
- **MarkItDown**: Installed via pip
- **Ollama**: User must install and run separately

---

## 13. File Structure

```
subscript/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs                 # Tauri app entry point
│   │   ├── commands/
│   │   │   ├── mod.rs
│   │   │   ├── email.rs            # Email sync commands
│   │   │   ├── pending.rs          # Pending imports CRUD
│   │   │   ├── subscriptions.rs    # Subscription CRUD
│   │   │   ├── domains.rs          # Domain CRUD
│   │   │   └── settings.rs         # Settings commands
│   │   ├── services/
│   │   │   ├── mod.rs
│   │   │   ├── imap.rs             # IMAP connection logic
│   │   │   ├── markitdown.rs       # MarkItDown subprocess
│   │   │   ├── ollama.rs           # Ollama API client
│   │   │   └── database.rs         # SQLite helpers
│   │   ├── models/
│   │   │   ├── mod.rs
│   │   │   ├── subscription.rs
│   │   │   ├── domain.rs
│   │   │   ├── pending_import.rs
│   │   │   └── settings.rs
│   │   └── utils/
│   │       ├── mod.rs
│   │       ├── crypto.rs           # Keyring wrapper
│   │       ├── file.rs             # File path helpers
│   │       └── currency.rs         # Currency conversion
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── pending/
│   │   │   ├── PendingQueueView.tsx
│   │   │   ├── PendingImportCard.tsx
│   │   │   ├── BatchActionsBar.tsx
│   │   │   └── ClassificationBadge.tsx
│   │   ├── subscriptions/
│   │   │   ├── SubscriptionList.tsx
│   │   │   ├── SubscriptionCard.tsx
│   │   │   └── AddSubscriptionDialog.tsx
│   │   ├── domains/
│   │   │   ├── DomainList.tsx
│   │   │   ├── DomainCard.tsx
│   │   │   └── AddDomainDialog.tsx
│   │   ├── settings/
│   │   │   ├── SettingsView.tsx
│   │   │   └── SettingsSection.tsx
│   │   ├── ui/
│   │   │   ├── button.tsx          # Shadcn components
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   └── ... (other Shadcn components)
│   │   └── shared/
│   │       ├── CurrencyDisplay.tsx
│   │       ├── DateCountdown.tsx
│   │       ├── PDFPreview.tsx
│   │       ├── SyncStatusIndicator.tsx
│   │       └── EmptyState.tsx
│   ├── hooks/
│   │   ├── usePendingImports.ts
│   │   ├── useSubscriptions.ts
│   │   ├── useDomains.ts
│   │   ├── useSettings.ts
│   │   └── useEmailSync.ts
│   ├── lib/
│   │   ├── tauri.ts                # Tauri API wrappers
│   │   ├── types.ts                # TypeScript interfaces
│   │   ├── constants.ts            # App constants
│   │   └── utils.ts                # Helper functions
│   ├── styles/
│   │   └── globals.css
│   └── vite-env.d.ts
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 14. Open Questions for Implementation

1. **Ollama Default Model**: Should we default to `llama3.2` (faster) or `mistral` (more accurate)?
   - **Recommendation**: `llama3.2` for speed, let user switch if needed

2. **Currency Conversion**: Use static rates or fetch live rates from an API?
   - **Recommendation**: Static rates for MVP, add live API in post-MVP

3. **Attachment Priority**: If an email has both PDF and DOCX, which takes precedence?
   - **Recommendation**: PDF first, then DOCX, then images, then email body

4. **LLM Confidence Threshold**: Auto-approve if confidence > X%?
   - **Recommendation**: No auto-approve for MVP, always require user review

5. **Database Migrations**: How to handle schema changes in future versions?
   - **Recommendation**: Use simple versioning in settings table, manual migrations initially

6. **Error Logging**: Where to store sync errors and LLM failures?
   - **Recommendation**: Add `error_logs` table for debugging

7. **Timezone Handling**: Store dates in UTC or local time?
   - **Recommendation**: Store in UTC, display in user's local timezone

---

## 15. Success Metrics (Post-Launch)

- **Adoption**: Number of active users tracking subscriptions
- **Accuracy**: LLM classification success rate (target: >85%)
- **Efficiency**: Average time from email receipt to confirmed entry (target: <2 minutes)
- **Retention**: Receipt archive utilization (% of users accessing old receipts)
- **Satisfaction**: User-reported issues per 100 syncs (target: <5)

---

## 16. Support & Documentation

### User Documentation (Post-MVP)
- Getting started guide (install Ollama, set up email)
- Troubleshooting common issues (IMAP connection, MarkItDown errors)
- FAQ (supported email providers, attachment formats)
- Privacy policy (local data storage, no cloud sync)

### Developer Documentation
- Architecture overview (this document)
- Contribution guidelines
- API reference for Tauri commands
- Database schema reference

---

## 17. License & Attribution

- **License**: MIT (or user's choice)
- **Credits**:
  - Tauri framework
  - MarkItDown by Microsoft
  - Ollama for local LLMs
  - Shadcn/ui component library

---

**END OF SPECIFICATION**

This specification is ready for Claude Code implementation. All major decisions have been made, and the architecture is defined. The focus is on creating a beautiful, functional MVP with the pending review flow as the centerpiece.
