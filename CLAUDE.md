# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SubScript** is a local-first desktop application for tracking subscriptions and domain registrations through automated email receipt processing. Built with **Tauri 2.x** (Rust backend) and **React/TypeScript** (frontend), it monitors IMAP email for receipts, extracts data using local Ollama LLM, and presents results for user review before saving.

**Current Status**: Phase 1 (Initialization), Phase 2 (Database & Backend), and Phase 3 (Pending Review UI) are COMPLETED. The application has a functional backend with SQLite, Tauri commands, and a React frontend for reviewing pending imports. Standardized on camelCase for API boundary and implemented structured error handling.

## Technology Stack

- **Backend**: Tauri 2.x, Rust, SQLite (rusqlite), IMAP client
- **Frontend**: React 18+, TypeScript (strict mode), Tailwind CSS, Shadcn/ui, Vite
- **Testing**: Vitest, React Testing Library, happy-dom (Frontend) / Cargo test (Backend)
- **Package Manager**: pnpm (fast, disk-efficient alternative to npm)
- **External**: Python 3.8+ (MarkItDown), Ollama (local LLM)
- **Code Quality**: ESLint (40+ strict rules), Prettier

## Development Commands

**Note**: This project uses **pnpm** as the package manager. [Install pnpm](https://pnpm.io/installation) if not already available.

### Package Management
```bash
pnpm install              # Install all dependencies
pnpm add <package>        # Add production dependency
pnpm add -D <package>     # Add dev dependency
pnpm remove <package>     # Remove dependency
```

### Linting and Formatting
```bash
pnpm lint                 # Check TypeScript/React code quality
pnpm lint:fix             # Auto-fix ESLint violations
pnpm format               # Format code with Prettier
pnpm format:check         # Verify formatting without changes
```

### Build and Run (when scaffolded)
```bash
pnpm dev                  # Start development server
pnpm build                # Create production build
pnpm tauri dev            # Run Tauri app in dev mode
pnpm tauri build          # Build production Tauri app
```

### Testing (when implemented)
```bash
pnpm test                 # Run all tests
pnpm test:watch           # Run tests in watch mode
pnpm test:coverage        # Generate coverage report
```

## Architecture Overview

### Email Processing Pipeline

1. **Background Sync** (every 30min) → IMAP connection to user's email
2. **Email Fetching** → Unread emails only
3. **Attachment Extraction** → Priority: PDF > DOCX/images > email body
4. **MarkItDown Conversion** → PDFs/documents to markdown
5. **Ollama LLM Analysis** → Classify (subscription/domain/junk) + extract data
6. **Pending Queue** → Save to `pending_imports` table
7. **User Review** → Approve/edit in UI before committing to production tables

### Database Architecture (SQLite)

**Dual instances** for production and test data:

- `subscriptions` - Recurring services (monthly/yearly/one-time)
- `domains` - Domain registrations with expiry tracking
- `pending_imports` - Review queue with LLM-extracted data
- `receipts` - 1-year archive of original documents (Base64 + metadata)
- `settings` - IMAP config, Ollama endpoint, display preferences

See `ARCHITECTURE.md` for complete SQL schema and TypeScript models.

### Project Structure (Planned)

```
src-tauri/
├── src/
│   ├── commands/          # Tauri command handlers (30+ commands)
│   ├── services/          # IMAP, Ollama, DB logic
│   ├── models/            # Rust data structures
│   └── utils/

src/
├── components/
│   ├── pending/           # MVP PRIORITY: Review queue UI
│   ├── subscriptions/     # Subscription management
│   ├── domains/           # Domain management
│   ├── settings/          # App configuration
│   ├── shared/            # Reusable components
│   └── ui/                # Shadcn base components
├── hooks/                 # Custom React hooks
├── lib/
│   ├── tauri.ts           # Tauri command wrappers
│   ├── types.ts           # TypeScript interfaces
│   └── utils.ts           # Utility functions
└── styles/
```

### Tauri Command Pattern

All Rust backend calls are wrapped in `src/lib/tauri.ts`:

```typescript
export async function fetchPendingImports(): Promise<PendingImport[]> {
  return invoke<PendingImport[]>('fetch_pending_imports');
}
```

Components never call `invoke()` directly - always use typed wrappers.

### Component Organization

- **Feature-based folders**: Group related components (e.g., `pending/`, `subscriptions/`)
- **Max file size**: 200 lines per file, 150 lines per component
- **Max function size**: 50 lines, max 4 parameters, complexity ≤10
- **Functional components only**: No class components
- **Import order**: React → External libraries → Internal modules → Types

## Code Standards

### TypeScript Strictness

- **No `any` types** - Use proper TypeScript interfaces
- **Explicit return types** - All functions must declare return type
- **Strict null checks** - Handle `null` and `undefined` explicitly
- **No type assertions** - Avoid `as` unless absolutely necessary

### React Best Practices

- **Functional components** with hooks (no classes)
- **Pure functions** preferred - minimize side effects
- **Small hook dependency arrays** - max 3 dependencies
- **Explicit event handlers** - `onClick={handleClick}` not inline functions
- **Proper cleanup** - return cleanup functions from `useEffect`

### File Organization

- **Feature-based structure** - components grouped by domain (not by type)
- **One component per file** - exception: tightly coupled sub-components
- **Consistent naming**:
  - Components: `PascalCase.tsx`
  - Utilities: `camelCase.ts`
  - Types: `types.ts` (interfaces exported)
  - Constants: `UPPER_SNAKE_CASE`

### Styling with Tailwind

- **Utility classes only** - no custom CSS unless necessary
- **Responsive design** - mobile-first approach
- **Shadcn/ui components** - use for buttons, dialogs, forms, etc.
- **Consistent spacing** - use Tailwind spacing scale (4px increments)

## Key Implementation Details

### Test Mode

Emails with `[test]` in subject line route to separate test database. This allows safe testing without polluting production data.

```rust
// Check if email subject contains [test]
if subject.to_lowercase().contains("[test]") {
    db_path = "subscript_test.db";
}
```

### Ollama Integration

Local LLM runs on user's machine (default: `http://localhost:11434`). System prompt instructs model to:
1. Classify email as `subscription`, `domain`, or `junk`
2. Extract structured data (name, cost, billing cycle, etc.)
3. Return JSON response matching TypeScript interfaces

See `ARCHITECTURE.md` section 7.1 for complete prompt and example responses.

### IMAP Security

Email credentials stored in **Tauri secure keyring** (never plaintext). Connection uses TLS. Passwords never logged or stored in SQLite.

### Receipt Archive

Original emails/PDFs stored as Base64 in `receipts` table. Auto-delete after 1 year. Max file size: 10MB per receipt.

## MVP Implementation Priority

**Phase 1-2** (Weeks 1-2):
1. Initialize Tauri + React project
2. Set up SQLite database with schema from `ARCHITECTURE.md`
3. Implement core Tauri commands (settings, database CRUD)

**Phase 3** (Week 3):
4. Build IMAP sync engine (background task)
5. Integrate MarkItDown for document conversion
6. Implement Ollama LLM extraction pipeline

**Phase 4** (Week 4):
7. **Create pending review UI** (TOP PRIORITY)
   - Masonry grid of import cards
   - Approve/reject/edit actions
   - Batch operations
8. Build manual entry forms
9. Create settings panel

**Post-MVP**:
- Subscription/Domain list views
- Search and filtering
- Bulk editing
- Export functionality

## Important Constraints

1. **Local-first**: No cloud sync, all data stored locally
2. **No auto-approve**: User must review all LLM extractions before saving
3. **Privacy-focused**: Ollama runs locally, no API keys sent to cloud
4. **Simplicity over features**: Keep codebase minimal and readable
5. **Type safety**: Strict TypeScript everywhere, interfaces in `lib/types.ts`

## Reference Documentation

- **ARCHITECTURE.md** (1300+ lines) - Complete technical specification, database schema, all Tauri commands, UI/UX specs, implementation checklist
- **.cursorrules** (550+ lines) - Coding standards, React patterns, Tauri integration, testing strategy
- **ESLINT_README.md** - Detailed explanation of all 40+ ESLint rules with examples
- **eslintrc.json** - Strict linting configuration (ERROR level enforcement)

## Common Patterns

### Adding a New Tauri Command

1. Define Rust command in `src-tauri/src/commands/`
2. Add TypeScript wrapper in `src/lib/tauri.ts`
3. Define interfaces in `src/lib/types.ts`
4. Use wrapper in components

### Creating a New Component

1. Place in feature folder (e.g., `components/pending/`)
2. Keep under 150 lines (extract sub-components if needed)
3. Define props interface inline or in `lib/types.ts`
4. Use Shadcn/ui components for base elements
5. Follow import order: React → External → Internal → Types

### Database Changes

1. Update SQL schema in `ARCHITECTURE.md`
2. Modify Rust models in `src-tauri/src/models/`
3. Update TypeScript interfaces in `src/lib/types.ts`
4. Write migration if modifying existing schema

## UI/UX Philosophy

- **Distinctive design**: Avoid generic AI aesthetics - use `frontend-design` skill
- **Information density**: Show important data without clutter
- **Quick actions**: Keyboard shortcuts, batch operations
- **Visual feedback**: Loading states, success/error messages
- **Responsive**: Mobile-first, works on all screen sizes

## Git Workflow

- **Conventional commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- **Branch naming**: `feature/`, `bugfix/`, `refactor/`
- **Small commits**: One logical change per commit
- **Descriptive messages**: Explain "why" not just "what"
