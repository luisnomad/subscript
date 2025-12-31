# SubScript - Project Status Report

**Generated**: December 31, 2025

---

## Overall Status: ⚠️ Moderate - Needs Attention

The foundation is solid, but technical debt is accumulating. A cleanup sprint is recommended before adding more features.

---

## Phase Progress

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Project Initialization | ✅ Completed | Tauri + React + TypeScript + Vite |
| Phase 2: Database & Backend | ✅ Completed | SQLite, Rust models, Tauri commands |
| Phase 3: Pending Review UI | ✅ Completed | Cards, batch actions, confidence scores |
| Phase 4: Manual Entry & Testing | ✅ Completed | Add dialogs, mock data, basic views |
| Phase 4.5: Code Review & Bug Fixes | 🚧 In Progress | Tests added, but issues remain |
| Phase 5: Subscription & Domain Management | ⏳ Not Started | Navigation, list views, edit dialogs |

---

## Test Results

### Frontend (Vitest)
```
✅ 19/19 tests passing
- src/lib/utils.test.ts (3 tests)
- src/components/pending/ConfidenceScore.test.tsx (3 tests)
- src/components/subscriptions/SubscriptionsView.test.tsx (3 tests)
- src/components/domains/DomainsView.test.tsx (3 tests)
- src/components/pending/PendingQueueView.test.tsx (4 tests)
- src/components/subscriptions/AddSubscriptionDialog.test.tsx (3 tests)
```

### Backend (Cargo)
```
⚠️ 9/10 tests passing (1 FAILED)

FAILED: test_approve_pending_import
Error: QueryReturnedNoRows
Location: src/commands/pending_imports.rs:348

The approval flow creates a pending import but fails to find
the created subscription afterward.
```

---

## Code Quality Issues

### ESLint Violations: ~30+ errors

| Category | Count | Examples |
|----------|-------|----------|
| Functions too long (>50 lines) | 4 | AddDomainDialog (127), CreatePendingImportDialog (250) |
| Import order issues | 15+ | Missing empty lines, wrong ordering |
| no-misused-promises | 1 | DomainsView.tsx:52 |
| Console statements left in | 3 | PendingQueueView, PendingImportCard |
| Magic numbers | 10+ | Various thresholds and constants |
| Missing curly braces | 1 | AddDomainDialog.tsx:80 |

### Rust Warnings

| Type | Details |
|------|---------|
| Unused struct | `SyncLog` never constructed |
| Unused functions | `is_valid_email`, `is_test_email` |
| Unused imports | `Subscription`, `Domain` in pending_imports.rs |

### TypeScript Issues (Current File)

File: `src/components/shared/SubscriptionFormFields.tsx`
- `'React' is declared but its value is never read`
- `Cannot find namespace 'JSX'`
- Function too long (92 lines, max 50)

---

## Architecture Concerns

### Naming Inconsistency

Rust models have internal names that differ from API names:
```rust
#[serde(rename = "cost")]
pub amount: f64,           // DB uses "amount", API uses "cost"

#[serde(rename = "billingCycle")]
pub periodicity: String,   // DB uses "periodicity", API uses "billingCycle"
```

This creates confusion when debugging between layers.

---

## Recommendations (Priority Order)

### 🔴 High Priority
1. **Fix failing Rust test** (`test_approve_pending_import`)
   - Core approval functionality may be broken
   - Investigate subscription creation in `approve_pending_import`

2. **Run lint fix and resolve errors**
   ```bash
   pnpm lint:fix
   ```
   Then manually fix remaining issues

### 🟡 Medium Priority
3. **Refactor oversized components**
   - Split `CreatePendingImportDialog` (250 lines → multiple components)
   - Split `AddDomainDialog` (127 lines)
   - Split form field components (90+ lines each)

4. **Remove debug code**
   - Delete `console.log` statements in PendingQueueView, PendingImportCard

5. **Clean up dead Rust code**
   - Remove or implement `SyncLog`, validation functions
   - Fix unused imports

### 🟢 Low Priority
6. **Unify naming conventions**
   - Pick `amount` OR `cost`, not both
   - Pick `periodicity` OR `billingCycle`, not both

7. **Add pre-commit hooks**
   - Enforce linting before commits
   - Prevent regression

---

## What's Working Well

- ✅ Typed Tauri wrappers (components never call `invoke()` directly)
- ✅ Structured error handling (`AppError` enum, `AppResult<T>`)
- ✅ Dual database architecture (production + test)
- ✅ Serde camelCase serialization for API boundary
- ✅ Good test coverage for existing features
- ✅ Well-documented architecture (ARCHITECTURE.md, CLAUDE.md)
- ✅ Bug tracking in BUGS.md

---

## Next Steps

Before continuing to Phase 5:
1. All tests must pass (currently 1 failing)
2. Lint errors must be resolved (currently 30+)
3. Dead code should be removed

Estimated cleanup time: 2-4 hours
