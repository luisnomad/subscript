# SubScript - Development Task List

**Last Updated**: December 31, 2025

**Note**: Phases have been reordered for better development flow - we build manual entry/testing capabilities before automation.

---

## ✅ Phase 1: Project Initialization (COMPLETED)

- [x] Initialize Tauri 2.x + React + TypeScript + Vite project
- [x] Configure pnpm package manager
- [x] Set up TypeScript strict mode with path aliases
- [x] Configure ESLint with 40+ strict rules
- [x] Configure Prettier for code formatting
- [x] Set up Tailwind CSS with Shadcn/ui
- [x] Create project folder structure (feature-based)
- [x] Define TypeScript interfaces (lib/types.ts)
- [x] Create Tauri command wrappers (lib/tauri.ts)
- [x] Create application constants (lib/constants.ts)
- [x] Implement Button component (Shadcn/ui)
- [x] Document Phase 1 progress

---

## ✅ Phase 2: Database & Backend Foundation (COMPLETED)

### Database Setup
- [x] Create SQLite schema initialization script
  - [x] `subscriptions` table with indexes
  - [x] `domains` table with indexes
  - [x] `pending_imports` table with indexes
  - [x] `receipts` table with indexes
  - [x] `settings` table (key-value store)
  - [x] `sync_log` table for tracking email sync
- [x] Implement dual database instances (production + test)
  - [x] `subscript.db` for production
  - [x] `subscript_test.db` for testing
  - [x] Database path resolution logic
- [x] Create Rust database models
  - [x] `Subscription` struct
  - [x] `Domain` struct
  - [x] `PendingImport` struct
  - [x] `Receipt` struct
  - [x] `AppSettings` struct
  - [x] `SyncLog` struct
- [x] Implement database migration system (schema versioning)
- [x] Create database utility functions (connection pooling, error handling)

### Rust Backend Structure
- [x] Set up Rust project structure in `src-tauri/src/`
  - [x] `commands/` module (Tauri command handlers)
  - [x] `services/` module (business logic)
  - [x] `models/` module (data structures)
  - [x] `utils/` module (helpers)
  - [x] `db/` module (database layer)
- [x] Add Rust dependencies to `Cargo.toml`
  - [x] `rusqlite` for SQLite
  - [x] `serde` for serialization
  - [x] `tokio` for async runtime
  - [x] `chrono` for date/time handling
  - [x] `anyhow` and `thiserror` for error handling
  - [x] `dirs` for cross-platform paths

### Tauri Commands - Subscriptions
- [x] `get_subscriptions` - Fetch all subscriptions
- [x] `get_subscription_by_id` - Fetch single subscription
- [x] `create_subscription` - Create new subscription
- [x] `update_subscription` - Update existing subscription
- [x] `delete_subscription` - Delete subscription
- [x] Add error handling and validation for all commands

### Tauri Commands - Domains
- [x] `get_domains` - Fetch all domains
- [x] `get_domain_by_id` - Fetch single domain
- [x] `create_domain` - Create new domain
- [x] `update_domain` - Update existing domain
- [x] `delete_domain` - Delete domain
- [x] Add error handling and validation for all commands

### Tauri Commands - Pending Imports
- [x] `get_pending_imports` - Fetch all pending imports
- [x] `approve_pending_import` - Approve and move to production
- [x] `reject_pending_import` - Delete pending import
- [x] `batch_approve_pending_imports` - Bulk approve
- [x] `batch_reject_pending_imports` - Bulk reject
- [x] Add error handling and validation for all commands

### Tauri Commands - Settings
- [x] `get_settings` - Fetch application settings
- [x] `update_settings` - Update application settings
- [x] `test_imap_connection` - Test IMAP credentials (placeholder)
- [ ] Implement secure credential storage (Tauri keyring) - Deferred to Phase 5
- [x] Add error handling and validation

### Tauri Commands - Receipts
- [x] `get_receipt_by_id` - Fetch receipt by ID
- [x] `delete_old_receipts` - Clean up receipts older than 1 year
- [x] Add error handling and validation

### Tauri Commands - Email Sync
- [x] `trigger_email_sync` - Manual sync trigger (placeholder)
- [x] `get_last_sync_time` - Fetch last sync timestamp
- [x] Add error handling and validation

### Tauri Commands - Database Management
- [x] `clear_test_database` - Wipe test database
- [x] `export_database` - Export database to file
- [x] Add error handling and validation

---

## ✅ Phase 3: Pending Review UI (COMPLETED - formerly Phase 4)

### Pending Queue View
- [x] Create `PendingQueueView.tsx` component
  - [x] Fetch pending imports on mount
  - [x] Display empty state if no imports
  - [x] Show loading state during fetch
  - [x] Handle fetch errors gracefully
- [x] Implement masonry grid layout
  - [x] Responsive columns (1/2/3 based on screen size)
  - [x] Card spacing and padding
  - [x] Smooth animations

### Pending Import Card Component
- [x] Create `PendingImportCard` component
  - [x] Display email metadata (subject, from, date)
  - [x] Show classification badge (subscription/domain)
  - [x] Display confidence score with color coding
  - [x] Render extracted data fields
  - [x] Show receipt preview (if available)
- [x] Create `ClassificationBadge` sub-component
  - [x] Color-coded badges (subscription: blue, domain: green)
  - [x] Icon support (lucide-react)
- [x] Create `SubscriptionFields` sub-component
  - [x] Display name, cost, currency, billing cycle
  - [x] Show next billing date
  - [x] Category display
  - [x] Editable fields for corrections
- [x] Create `DomainFields` sub-component
  - [x] Display domain name, registrar
  - [x] Show cost, currency
  - [x] Display expiry date with countdown
  - [x] Auto-renew toggle
  - [x] Editable fields for corrections
- [x] Implement edit mode
  - [x] Toggle between view/edit mode
  - [x] Form validation
  - [x] Save edited data
  - [x] Cancel and revert changes

### Card Actions
- [x] Implement approve action
  - [x] Call `approvePendingImport` Tauri command
  - [x] Show success toast notification
  - [x] Remove card from grid with animation
  - [x] Handle errors with error toast
- [x] Implement reject action
  - [x] Call `rejectPendingImport` Tauri command
  - [x] Show confirmation dialog
  - [x] Remove card from grid with animation
  - [x] Handle errors with error toast
- [x] Implement approve with edits
  - [x] Validate edited data
  - [x] Serialize edits to JSON string
  - [x] Call approve command with `editedData`
  - [x] Show success feedback

### Batch Operations
- [x] Create `BatchActionsBar` component
  - [x] Multi-select checkbox on each card
  - [x] Select all / Deselect all buttons
  - [x] Batch approve button
  - [x] Batch reject button
  - [x] Show count of selected items
- [x] Implement batch approve
  - [x] Call `batchApprovePendingImports` command
  - [x] Show progress indicator
  - [x] Remove approved cards from grid
  - [x] Show success summary toast
- [x] Implement batch reject
  - [x] Show confirmation dialog with count
  - [x] Call `batchRejectPendingImports` command
  - [x] Remove rejected cards from grid
  - [x] Show success summary toast

### Confidence Score Visualization
- [x] Create confidence score indicator
  - [x] Progress bar with color gradient
  - [x] High confidence (≥0.8): Green
  - [x] Medium confidence (0.5-0.8): Yellow
  - [x] Low confidence (<0.5): Red
  - [x] Percentage display

### Additional UI Components (Shadcn/ui)
- [x] Implement `Card` component
- [x] Implement `Badge` component
- [x] Implement `Dialog` component (for confirmations)
- [x] Implement `Input` component (for editing)
- [x] Implement `Select` component (for dropdowns)
- [x] Implement `Checkbox` component (for batch selection)
- [x] Implement `Toast` component (for notifications)
- [x] Implement `Progress` component (for confidence score)

### Design Implementation
- [x] Financial editorial aesthetic with custom fonts (DM Sans + JetBrains Mono)
- [x] Receipt-inspired visual details (grid texture, stamp badges)
- [x] Warm cream color palette with accent colors
- [x] Staggered animations and micro-interactions

---

## ✅ Phase 4: Manual Entry & Testing (COMPLETED)

**Purpose**: Build manual creation forms to test the pending review UI and validate the full data flow without email automation.

### Manual Pending Import Creation
- [x] Create `CreatePendingImportDialog` component
- [x] Add "Create Test Import" button to PendingQueueView
- [x] Create mock data generator utility

### Manual Entry Forms (Production)
- [x] Create `AddSubscriptionDialog` component
- [x] Create `AddDomainDialog` component
- [x] Add "Add Subscription" and "Add Domain" buttons to appropriate views
- [x] Create `SubscriptionsView` and `DomainsView` components
- [x] Implement basic navigation between views in `App.tsx`

### Settings Panel
- [ ] Create `SettingsView` component
  - [ ] Tabbed interface (IMAP, Ollama, Display, About)
  - [ ] Fetch settings on mount
  - [ ] Save button with loading state
- [ ] Create IMAP settings tab
  - [ ] Server, port, username, password fields
  - [ ] SSL/TLS toggle
  - [ ] "Test Connection" button
  - [ ] Connection status indicator
  - [ ] Save credentials securely (Tauri keyring)
- [ ] Create Ollama settings tab
  - [ ] Endpoint URL field (default: `http://localhost:11434`)
  - [ ] "Test Connection" button
  - [ ] Model selection (if multiple models available)
- [ ] Create display settings tab
  - [ ] Default currency selector
  - [ ] Sync interval selector (15/30/60 minutes)
  - [ ] Theme toggle (light/dark mode)
- [ ] Create about tab
  - [ ] App version display
  - [ ] Links to documentation
  - [ ] Export database button
  - [ ] Clear test database button

### Testing & Validation
- [x] Test full pending import flow
  - [x] Create pending import manually
  - [x] Review in pending queue
  - [x] Approve → verify in subscriptions/domains table
  - [x] Reject → verify removal
  - [x] Edit before approval → verify changes persist
- [x] Test batch operations
  - [x] Create multiple pending imports
  - [x] Select multiple items
  - [x] Batch approve → verify all saved
  - [x] Batch reject → verify all removed
- [x] Test edge cases
  - [x] Empty states (no pending, no subscriptions, no domains)
  - [x] Error handling (database errors, invalid data)
  - [x] Form validation (required fields, formats)

---

## 🚧 Phase 4.5: Code Review & Bug Fixes (IN PROGRESS)

**Purpose**: Address discovered bugs and add comprehensive testing to prevent regressions.

### Testing Infrastructure
- [x] Set up Vitest for frontend unit testing
- [x] Set up React Testing Library with happy-dom
- [x] Add sample frontend tests (utils and components)
- [x] Verify Rust built-in testing with `cargo test`
- [x] Add sample Rust unit tests

### Bug Fixes & Code Review
- [x] Review and fix field name inconsistencies (see [BUGS.md](BUGS.md#1-field-name-mismatch-between-typescript-and-rust-models))
  - [x] Audit all TypeScript interfaces in `src/lib/types.ts`
  - [x] Audit all Rust models in `src-tauri/src/models/mod.rs`
  - [x] Standardized on camelCase for frontend and snake_case for backend with Serde renaming
  - [x] Applied consistent `#[serde(rename_all = "camelCase")]` to Rust models
  - [x] Updated all components referencing old field names
- [x] Review all Tauri command wrappers in `src/lib/tauri.ts`
  - [x] Verify parameter naming matches Rust functions (fixed camelCase for Tauri 2.x)
  - [x] Add JSDoc documentation with examples
  - [x] Test each command with mock data
- [x] Improve error handling
  - [x] Add structured error types in Rust
  - [x] Include detailed error context in responses
  - [x] Update frontend to display specific error messages
- [x] Test with mock data
  - [x] Fixed serialization error for partial data in `extracted_data`
  - [x] Added comprehensive unit tests for approval/rejection logic
  - [ ] Generate mock pending imports (subscriptions and domains)
  - [ ] Approve workflow end-to-end
  - [ ] Reject workflow
  - [ ] Edit before approve workflow
  - [ ] Batch operations

### Unit Testing Setup
- [ ] Set up testing framework for TypeScript
  - [ ] Install Vitest (recommended for Vite projects)
  - [ ] Configure test environment
  - [ ] Add test scripts to package.json
- [ ] Write Rust unit tests
  - [ ] Test Subscription model serialization/deserialization
  - [ ] Test Domain model serialization/deserialization
  - [ ] Test PendingImport model serialization/deserialization
  - [ ] Test with both camelCase and snake_case field names
  - [ ] Test database operations (CRUD)
- [ ] Write TypeScript unit tests
  - [ ] Test mock data generator
  - [ ] Test type interfaces match expected structure
  - [ ] Test Tauri command wrappers (with mocked invoke)
  - [ ] Test utility functions
- [ ] Write integration tests
  - [ ] Test full Tauri command flow (Rust + TypeScript)
  - [ ] Test data transformation between frontend and backend
  - [ ] Test error handling and edge cases
  - [ ] Mock database operations

### Test Coverage Goals
- [ ] Achieve >80% code coverage for utilities
- [ ] Achieve >70% code coverage for Rust commands
- [ ] All data models have serialization tests
- [ ] All Tauri commands have integration tests

---
## ✅ Phase 4.6: Code Quality & Refactoring (COMPLETED)

- [x] Perform full linting pass and resolve 110+ issues
- [x] Decompose large view components (`DomainsView`, `SubscriptionsView`)
- [x] Extract complex form logic into custom hooks (`useAddDomainForm`, `useAddSubscriptionForm`, `useCreatePendingImportForm`)
- [x] Create shared form sub-component library (`FormSubComponents.tsx`)
- [x] Eliminate magic numbers by centralizing constants in `lib/constants.ts`
- [x] Standardize import ordering across the entire project
- [x] Enforce 50-line function limit through component decomposition
- [x] Remove all `console.log` statements from production code

---
## 🚧 Phase 5: Subscription & Domain Management

### Subscription List View
- [ ] Create `SubscriptionListView` component
  - [ ] Fetch subscriptions on mount
  - [ ] Display in table or card grid
  - [ ] Sort options (name, cost, next billing date)
  - [ ] Filter options (status, category, billing cycle)
  - [ ] Search functionality
  - [ ] Empty state
- [ ] Create `SubscriptionCard` component
  - [ ] Display all subscription fields
  - [ ] Edit button → opens edit dialog
  - [ ] Delete button → confirmation dialog
  - [ ] Status indicator (active/cancelled/paused)
  - [ ] Days until next billing countdown
- [ ] Create `EditSubscriptionDialog` component
  - [ ] Pre-filled form with existing data
  - [ ] Update handler calling `updateSubscription`
  - [ ] Validation
  - [ ] Success/error feedback

### Domain List View
- [ ] Create `DomainListView` component
  - [ ] Fetch domains on mount
  - [ ] Display in table or card grid
  - [ ] Sort options (name, expiry date, registrar)
  - [ ] Filter options (status, registrar)
  - [ ] Search functionality
  - [ ] Empty state
- [ ] Create `DomainCard` component
  - [ ] Display all domain fields
  - [ ] Edit button → opens edit dialog
  - [ ] Delete button → confirmation dialog
  - [ ] Status indicator (active/expired/pending-renewal)
  - [ ] Days until expiry countdown (with color coding)
- [ ] Create `EditDomainDialog` component
  - [ ] Pre-filled form with existing data
  - [ ] Update handler calling `updateDomain`
  - [ ] Validation
  - [ ] Success/error feedback

### Navigation & Layout
- [ ] Create `AppShell` component
  - [ ] Sidebar navigation
  - [ ] Route highlighting
  - [ ] Responsive mobile menu
- [ ] Create `Header` component
  - [ ] App title/logo
  - [ ] Manual sync trigger button
  - [ ] Last sync time display
  - [ ] Settings button
- [ ] Create `Sidebar` component
  - [ ] Navigation links (Pending, Subscriptions, Domains, Settings)
  - [ ] Active route highlighting
  - [ ] Collapse/expand on mobile
- [ ] Set up routing
  - [ ] Install React Router (or similar)
  - [ ] Define routes for all views
  - [ ] Handle 404 page

---

## 🚧 Phase 6: Email Processing Pipeline (formerly Phase 3)

**Purpose**: Automate the pending import creation process using email processing.

### IMAP Integration
- [ ] Add IMAP dependencies to Cargo.toml
  - [ ] Research and select IMAP library (e.g., `async-imap`, `imap`)
  - [ ] Add TLS/SSL support
- [ ] Implement IMAP service module
  - [ ] Connection establishment with credentials
  - [ ] Fetch unread emails from INBOX
  - [ ] Mark emails as read after processing
  - [ ] Handle connection errors gracefully
  - [ ] Implement retry logic
- [ ] Implement attachment extraction
  - [ ] Parse MIME multipart messages
  - [ ] Extract PDF attachments
  - [ ] Extract DOCX/DOC attachments
  - [ ] Extract image attachments (fallback)
  - [ ] Handle Base64 encoding
  - [ ] Enforce 10MB file size limit
- [ ] Create background sync scheduler
  - [ ] Implement 30-minute interval sync
  - [ ] Allow manual sync trigger
  - [ ] Track last sync time
  - [ ] Handle sync conflicts
- [ ] Implement `[test]` subject detection
  - [ ] Route to test database if `[test]` in subject
  - [ ] Case-insensitive matching

### MarkItDown Integration
- [ ] Set up Python environment requirements
  - [ ] Create `requirements.txt` with MarkItDown
  - [ ] Document Python 3.8+ requirement
- [ ] Implement Python subprocess wrapper (Rust)
  - [ ] Execute MarkItDown on PDF files
  - [ ] Execute MarkItDown on DOCX files
  - [ ] Parse markdown output
  - [ ] Handle conversion errors
  - [ ] Clean up temporary files
- [ ] Create fallback logic
  - [ ] If no attachment, use email body text
  - [ ] Handle conversion failures gracefully

### Ollama Integration
- [ ] Design system prompt for LLM
  - [ ] Classification instructions (subscription/domain/junk)
  - [ ] Extraction instructions (structured JSON)
  - [ ] Example inputs/outputs for few-shot learning
  - [ ] Confidence scoring guidelines
- [ ] Implement Ollama API client (Rust)
  - [ ] HTTP client for `http://localhost:11434`
  - [ ] POST to `/api/generate` endpoint
  - [ ] Handle streaming responses
  - [ ] Parse JSON responses
  - [ ] Error handling for API failures
- [ ] Create extraction service
  - [ ] Send markdown to Ollama with system prompt
  - [ ] Parse LLM response into structured data
  - [ ] Validate extracted JSON schema
  - [ ] Calculate confidence score (0.0 to 1.0)
- [ ] Implement junk detection
  - [ ] Filter out non-receipt emails
  - [ ] Skip processing for junk classification

### Email Processing Workflow
- [ ] Implement end-to-end pipeline
  - [ ] Fetch unread emails via IMAP
  - [ ] Extract attachments or body text
  - [ ] Convert to markdown via MarkItDown
  - [ ] Send to Ollama for classification/extraction
  - [ ] Save to `pending_imports` table
  - [ ] Store receipt in `receipts` table
  - [ ] Update `sync_log` table
- [ ] Add comprehensive error handling
  - [ ] Log all errors to console
  - [ ] Continue processing on single email failure
  - [ ] Provide user feedback on sync status

---

## 🧪 Phase 7: Testing

### Unit Tests
- [ ] Set up testing framework (Vitest recommended for Vite)
- [ ] Write tests for utility functions
  - [ ] `cn()` class name merger
  - [ ] Date formatting utilities (when implemented)
  - [ ] Currency formatting utilities (when implemented)
- [ ] Write tests for TypeScript type guards (if any)
- [ ] Achieve >80% code coverage for utilities

### Component Tests
- [ ] Write tests for UI components
  - [ ] Button variants render correctly
  - [ ] Card component renders children
  - [ ] Badge displays correct colors
  - [ ] Form inputs handle validation
- [ ] Write tests for feature components
  - [ ] PendingImportCard displays data correctly
  - [ ] Approve/reject actions work
  - [ ] Edit mode toggles properly
  - [ ] Batch selection works
- [ ] Mock Tauri commands for component tests

### Integration Tests
- [ ] Test Tauri command integration
  - [ ] Mock Rust backend responses
  - [ ] Test error handling
  - [ ] Test loading states
- [ ] Test email processing pipeline (when implemented)
  - [ ] Mock IMAP responses
  - [ ] Mock MarkItDown responses
  - [ ] Mock Ollama responses
  - [ ] Verify data flow end-to-end

### E2E Tests
- [ ] Set up Playwright or Cypress
- [ ] Write E2E tests for critical user flows
  - [ ] Review pending import → approve → verify in subscriptions list
  - [ ] Review pending import → reject → verify removal
  - [ ] Manual entry → create subscription → verify in list
  - [ ] Edit subscription → save → verify changes
  - [ ] Delete subscription → confirm → verify removal
  - [ ] Configure IMAP settings → test connection → save
  - [ ] Trigger manual sync → verify new imports appear

### Rust Tests
- [ ] Write unit tests for Rust backend
  - [ ] Database operations (CRUD)
  - [ ] IMAP connection logic
  - [ ] Ollama API client
  - [ ] Email parsing logic
- [ ] Write integration tests for Tauri commands
  - [ ] Test command handlers with mock database
  - [ ] Verify error handling
  - [ ] Test dual database routing

---

## 📚 Phase 8: Documentation & Polish

### User Documentation
- [ ] Create user guide (docs/user-guide.md)
  - [ ] Installation instructions
  - [ ] Initial setup (IMAP, Ollama)
  - [ ] How to review pending imports
  - [ ] How to manually add subscriptions/domains
  - [ ] How to edit/delete entries
  - [ ] How to export data
  - [ ] Troubleshooting common issues
- [ ] Create FAQ (docs/faq.md)
- [ ] Add screenshots to documentation

### Developer Documentation
- [ ] Update ARCHITECTURE.md with implementation details
- [ ] Create API documentation (docs/api.md)
  - [ ] Document all Tauri commands
  - [ ] Parameter descriptions
  - [ ] Return types
  - [ ] Error codes
- [ ] Create CONTRIBUTING.md
  - [ ] Code style guide (link to .cursorrules)
  - [ ] PR process
  - [ ] Testing requirements
- [ ] Document database schema with ER diagrams

### README Updates
- [ ] Add project description
- [ ] Add installation instructions
- [ ] Add quick start guide
- [ ] Add development setup instructions
- [ ] Add build instructions
- [ ] Add screenshots/demo GIF
- [ ] Add license information
- [ ] Add contributor guidelines link

### Code Comments
- [ ] Add JSDoc comments to all public functions
- [ ] Add inline comments for complex logic
- [ ] Document all Rust modules
- [ ] Document all TypeScript interfaces

---

## 🎨 Phase 9: UI/UX Enhancements (Post-MVP)

### Design Improvements
- [ ] Use `frontend-design` skill for unique aesthetics
- [ ] Create custom color palette (avoid generic AI colors)
- [ ] Design custom icons/illustrations
- [ ] Add micro-interactions and animations
- [ ] Implement skeleton loaders
- [ ] Add empty state illustrations

### Advanced Features
- [ ] Implement search across all entities
- [ ] Add filtering by multiple criteria
- [ ] Create dashboard with analytics
  - [ ] Total monthly cost
  - [ ] Cost breakdown by category
  - [ ] Upcoming renewals calendar view
  - [ ] Cost trends over time (charts)
- [ ] Add bulk editing capabilities
- [ ] Implement undo/redo functionality
- [ ] Add keyboard shortcuts
- [ ] Create guided onboarding flow

### Accessibility
- [ ] Audit with axe DevTools
- [ ] Ensure proper ARIA labels
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Ensure sufficient color contrast
- [ ] Add focus indicators

---

## 🚀 Phase 10: Release Preparation

### Performance Optimization
- [ ] Audit bundle size
- [ ] Implement code splitting
- [ ] Optimize images and assets
- [ ] Add virtualization for long lists (react-window)
- [ ] Profile React component renders
- [ ] Optimize database queries

### Security Audit
- [ ] Review credential storage (ensure keyring usage)
- [ ] Audit for SQL injection vulnerabilities
- [ ] Ensure HTTPS for Ollama endpoint
- [ ] Review IMAP TLS/SSL implementation
- [ ] Scan dependencies for vulnerabilities

### Build & Distribution
- [ ] Configure Tauri build settings
  - [ ] App name, version, description
  - [ ] App icons (all sizes)
  - [ ] Code signing certificates (if applicable)
- [ ] Create installers for all platforms
  - [ ] macOS (.dmg, .app)
  - [ ] Windows (.exe, .msi)
  - [ ] Linux (.AppImage, .deb)
- [ ] Test installers on clean machines
- [ ] Set up auto-update mechanism (Tauri updater)

### Release Checklist
- [ ] Version bump in package.json and Cargo.toml
- [ ] Create CHANGELOG.md
- [ ] Tag release in git
- [ ] Create GitHub release
- [ ] Upload installers to GitHub releases
- [ ] Write release announcement
- [ ] Update documentation for new version

---

## 📊 Progress Tracking

**Overall Completion**: ~40% (Phases 1-3 complete, Phase 4.5 complete)

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Initialization | ✅ Complete | 100% |
| Phase 2: Database & Backend | ✅ Complete | 100% |
| Phase 3: Pending Review UI | ✅ Complete | 100% |
| Phase 4: Manual Entry & Testing | 🚧 In Progress | 10% |
| Phase 4.5: Code Review & Bug Fixes | ✅ Complete | 100% |
| Phase 5: Subscription/Domain UI | 🚧 Not Started | 0% |
| Phase 6: Email Processing | 🚧 Not Started | 0% |
| Phase 7: Testing | 🚧 Not Started | 0% |
| Phase 8: Documentation | 🚧 Not Started | 0% |
| Phase 9: UI/UX Enhancements | 🚧 Not Started | 0% |
| Phase 10: Release Prep | 🚧 Not Started | 0% |

**Note**: Phase 4.5 should be completed before continuing with Phase 5 to ensure data integrity and prevent cascading bugs.

---

## 🎯 MVP Definition (Minimum Viable Product)

**Core MVP Features** (must-have for v0.1.0):
1. ✅ Project scaffolding and configuration
2. ✅ Database setup with SQLite
3. ✅ Basic Tauri commands (subscriptions, domains, pending imports)
4. ✅ Pending review UI (approve/reject/edit) with distinctive design
5. 🚧 Manual import creation (for testing)
6. 🚧 Manual entry forms (subscriptions, domains)
7. 🚧 Basic list views (subscriptions, domains)
8. 🚧 Settings panel (Ollama endpoint, display settings)
9. 🚧 Navigation and routing
10. 🚧 Basic error handling and user feedback

**Post-MVP Features** (nice-to-have):
- IMAP automated sync
- MarkItDown integration
- Ollama LLM extraction
- Advanced filtering and search
- Analytics dashboard
- Bulk operations
- Export functionality
- Auto-update mechanism
- Mobile/tablet optimization

---

**End of Task List**
