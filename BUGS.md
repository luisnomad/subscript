# Known Bugs and Issues

**Last Updated**: December 31, 2025

This document tracks bugs discovered during development and their resolution status.

---

## 🐛 Active Bugs

*No active high-priority bugs at this time.*

---

## ✅ Resolved Bugs

### 1. Field Name Mismatch Between TypeScript and Rust Models

**Status**: ✅ Fixed

**Description**: 
- TypeScript interfaces use camelCase field names
- Rust models use snake_case field names
- Tauri does NOT automatically convert between naming conventions

**Fix**:
- Added `#[serde(rename_all = "camelCase")]` to all Rust models in `src-tauri/src/models/mod.rs`.
- Standardized on camelCase for all TypeScript interfaces in `src/lib/types.ts`.
- Updated `src/lib/tauri.ts` to use snake_case for `invoke` argument keys to match Rust parameters.
- Updated frontend components to use camelCase consistently.

### 2. Incomplete Field Mapping in Mock Data Generator

**Status**: ✅ Fixed

**Description**:
- Mock data generator used inconsistent field names.

**Fix**:
- Standardized on camelCase in `mockDataGenerator.ts` and ensured it matches the `PendingImport` interface.

### 3. Missing Error Handling in Tauri Commands

**Status**: ✅ Fixed

**Description**:
- Tauri commands provided generic error messages.

**Fix**:
- Implemented structured error handling with `AppError` enum and `AppResult` type in `src-tauri/src/utils/error.rs`.
- Updated all Tauri commands to return `AppResult<T>`, providing better error propagation to the frontend.

---

## ✅ Resolved Bugs

### 1. Tauri API Not Available Error

**Resolved**: December 31, 2025

**Description**: App showed "Tauri is not available" error when trying to generate mock data

**Root Cause**: 
- Running app in browser (`pnpm dev`) instead of Tauri window (`pnpm tauri dev`)
- Overly strict Tauri detection logic checking for `window.__TAURI__`

**Solution**: 
- Simplified detection to check if `invoke` function is available
- Documentation updated to always use `pnpm tauri dev` for development

**Files Fixed**:
- `src/lib/tauri.ts` - Simplified Tauri detection check

---

### 2. Missing `extracted_data` Field

**Resolved**: December 31, 2025

**Description**: Frontend couldn't access `extractedData` field from pending imports

**Root Cause**: TypeScript interface used camelCase but Rust returns snake_case

**Solution**: Updated TypeScript interface to match Rust field names

**Files Fixed**:
- `src/lib/types.ts` - Changed `extractedData` to `extracted_data`
- `src/components/pending/PendingImportCard.tsx` - Updated field references
- `src/components/pending/EditDialog.tsx` - Updated field references

### 4. Tauri 2.x Command Argument Naming Convention

**Status**: ✅ Fixed

**Description**: 
- Tauri 2.x expects camelCase for command arguments passed from the frontend via `invoke`.
- Using snake_case (e.g., `test_mode`) resulted in "missing required key" errors.

**Fix**:
- Updated all `invoke` calls in `src/lib/tauri.ts` to use camelCase for argument keys (e.g., `testMode`).

### 5. Rust Serialization Error for Partial Data

**Status**: ✅ Fixed

**Description**: 
- The `Subscription` and `Domain` models required fields (like `status`) that were not present in the `extracted_data` JSON stored in the `pending_imports` table.
- This caused `serde_json::from_str` to fail when approving imports.

**Fix**:
- Introduced `SubscriptionExtraction` and `DomainExtraction` structs in `src-tauri/src/models/mod.rs` that only contain the fields expected in the extracted JSON.
- Updated `approve_pending_import` in `src-tauri/src/commands/pending_imports.rs` to use these extraction structs.

---

## 🧪 Testing Gaps

The following bugs could have been caught with proper testing:

1. **Field Name Mismatches**: Unit tests for serialization/deserialization
2. **Missing Fields**: Integration tests for Tauri commands
3. **Null/Undefined Values**: Property-based testing for data validation

**Required Test Coverage**:
- [ ] Unit tests for Rust models (serialization/deserialization)
- [ ] Unit tests for TypeScript types (mock data validation)
- [ ] Integration tests for all Tauri commands
- [ ] E2E tests for critical user flows (approve/reject workflow)
- [ ] Property-based tests for data transformation

---

## 📋 Bug Prevention Checklist

Before adding new features:

- [ ] Ensure TypeScript and Rust types are synchronized
- [ ] Test serialization/deserialization of all data structures
- [ ] Add unit tests for new Tauri commands
- [ ] Verify field naming conventions (snake_case vs camelCase)
- [ ] Add error handling with detailed messages
- [ ] Test with mock data before implementing real data sources

---

## 🔍 Areas Requiring Review

1. **All Tauri Command Wrappers** (`src/lib/tauri.ts`)
   - Verify parameter naming conventions
   - Add JSDoc with parameter examples

2. **All Rust Models** (`src-tauri/src/models/mod.rs`)
   - Add comprehensive serde aliases
   - Consider using `#[serde(rename_all = "camelCase")]`

3. **All TypeScript Interfaces** (`src/lib/types.ts`)
   - Audit for consistency with Rust models
   - Document expected field names

4. **All Components Using PendingImport** 
   - Search for camelCase field references
   - Update to snake_case where necessary

---

**End of Bug Log**
