# Known Bugs and Issues

**Last Updated**: December 31, 2025

This document tracks bugs discovered during development and their resolution status.

---

## 🐛 Active Bugs

### 1. Field Name Mismatch Between TypeScript and Rust Models

**Status**: 🔧 Partially Fixed

**Description**: 
- TypeScript interfaces use camelCase field names (e.g., `cost`, `billingCycle`, `domainName`)
- Rust models use snake_case field names (e.g., `amount`, `periodicity`, `name`)
- Tauri does NOT automatically convert between naming conventions

**Impact**: 
- High - Breaks data serialization/deserialization between frontend and backend
- Causes JSON parsing errors and missing field errors

**Root Cause**:
- Assumption that Tauri would automatically handle case conversion
- Inconsistent naming conventions across codebase

**Current Fixes Applied**:
1. Added `#[serde(alias = "...")]` attributes to Rust models to accept camelCase names
2. Updated TypeScript `PendingImport` interface to use snake_case field names to match Rust

**Remaining Issues**:
- `Subscription` and `Domain` TypeScript interfaces still use camelCase
- Need to verify all Tauri command parameters use correct casing
- Frontend components may still reference old field names

**Files Affected**:
- `src/lib/types.ts` - TypeScript type definitions
- `src-tauri/src/models/mod.rs` - Rust data models
- `src/components/pending/PendingImportCard.tsx` - Updated to use snake_case
- `src/components/pending/EditDialog.tsx` - Updated to use snake_case

**Recommended Solution**:
- Option A: Standardize on snake_case throughout (Rust convention)
- Option B: Standardize on camelCase throughout (JavaScript convention)
- Option C: Add comprehensive serde aliases for all fields (current approach)
- **Recommended**: Option B with serde rename_all at struct level

**Example Fix**:
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Subscription {
    pub id: Option<i64>,
    pub name: String,
    pub amount: f64,  // Will serialize as "amount" but accept "cost" as alias
    // ...
}
```

---

### 2. Incomplete Field Mapping in Mock Data Generator

**Status**: 🔧 Partially Fixed

**Description**:
- Mock data generator uses TypeScript field names (`cost`, `billingCycle`)
- Rust expects different field names (`amount`, `periodicity`)
- Added serde aliases as temporary fix

**Impact**: Medium - Breaks approve workflow for pending imports

**Files Affected**:
- `src/lib/mockDataGenerator.ts`
- `src-tauri/src/models/mod.rs`

---

### 3. Missing Error Handling in Tauri Commands

**Status**: ⚠️ Open

**Description**:
- Some Tauri commands don't provide detailed error messages
- Frontend shows generic "Failed to approve import" without context
- Need better error propagation from Rust to TypeScript

**Impact**: Medium - Makes debugging difficult

**Recommended Fix**:
- Add structured error types in Rust
- Include detailed error information in responses
- Log errors with context on both frontend and backend

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
