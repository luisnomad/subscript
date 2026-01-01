# SubScript - Development Task List

**Last Updated**: December 31, 2025

**Note**: Completed tasks have been moved to [COMPLETED_TASKS.md](COMPLETED_TASKS.md).

---

## 📱 Phase 5: Subscription & Domain Management

**Purpose**: Implement the main list views and management interfaces for active subscriptions and domains.

### Navigation & Layout
- [ ] Implement sidebar/tabs for switching between views
  - [ ] Subscriptions View
  - [ ] Domains View
  - [ ] Pending Review (Current)
  - [ ] Settings

### Subscriptions View
- [ ] Implement list/grid view of active subscriptions
- [ ] Add filtering by category and periodicity
- [ ] Add sorting by name, cost, and next billing date
- [ ] Implement "Edit Subscription" dialog
- [ ] Implement "Delete Subscription" confirmation

### Domains View
- [ ] Implement list/grid view of active domains
- [ ] Add sorting by name and expiry date
- [ ] Implement "Edit Domain" dialog
- [ ] Implement "Delete Domain" confirmation

### Dashboard/Overview (Optional)
- [ ] Monthly/Yearly cost summary
- [ ] Upcoming renewals alert

---

## 🧪 Phase 7: Testing

### Integration Tests
- [ ] Test email processing pipeline
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
  - [x] Initial setup (IMAP, Ollama) - See [docs/SETTING_UP_EMAIL.md](docs/SETTING_UP_EMAIL.md)
  - [ ] Installation instructions
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
- [ ] (Non-critical) Implement dark mode support (hook up existing setting)
- [ ] Design custom icons/illustrations
- [ ] Add micro-interactions and animations
- [ ] Implement skeleton loaders
- [ ] Add empty state illustrations

### Advanced Features
- [ ] Implement search across all entities
- [ ] Add filtering by multiple criteria
- [ ] (Non-critical) Support for list view (compact rows/columns like Excel)
- [ ] (Non-critical) Currency conversion: Update all displays when default currency changes
- [ ] (Non-critical) Enhanced Pending tab warnings:
  - [ ] Paused subscriptions with due dates
  - [ ] Bills for cancelled subscriptions
  - [ ] Domains about to auto-renew
  - [ ] Domains with no auto-renew about to expire
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

**Overall Completion**: ~45% (Phases 1-4.5 complete)

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Initialization | ✅ Complete | 100% |
| Phase 2: Database & Backend | ✅ Complete | 100% |
| Phase 3: Pending Review UI | ✅ Complete | 100% |
| Phase 4: Manual Entry & Testing | ✅ Complete | 100% |
| Phase 4.5: Code Review & Bug Fixes | ✅ Complete | 100% |
| Phase 5: Subscription/Domain UI | 🚧 In Progress | 90% |
| Phase 6: Email Processing | ✅ Complete | 100% |
| Phase 7: Testing | ✅ Complete | 100% |
| Phase 8: Documentation | 🚧 Not Started | 0% |
| Phase 9: UI/UX Enhancements | 🚧 Not Started | 0% |
| Phase 10: Release Prep | 🚧 Not Started | 0% |

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
