# SubScript ESLint Configuration

This ESLint configuration enforces the coding standards defined in `.cursorrules` programmatically.

## 🚨 Rules Enforced

### ✅ Strong Typing (ERROR level)
- **No `any` types** - Must use explicit types
- **Explicit return types** - All functions must declare return type
- **Type safety** - No unsafe assignments, calls, or returns
- **Strict null checks** - Proper handling of null/undefined

### ✅ Code Simplicity (ERROR level)
- **Max 50 lines per function** - Forces function extraction
- **Max 200 lines per file** - Enforces modular code
- **Max 4 parameters** - Encourages object parameters
- **Max depth 3** - Prevents deep nesting
- **Complexity max 10** - Keeps functions simple

### ✅ Functional Programming (ERROR/WARN level)
- **Prefer `const`** over `let` (ERROR)
- **No `var`** declarations (ERROR)
- **No parameter reassignment** (ERROR)
- **Prefer arrow functions** for callbacks (ERROR)
- **Discourage classes** (WARN)
- **Discourage `let`** (WARN)

### ✅ React Best Practices (ERROR level)
- **Hooks rules** - Correct dependency arrays
- **Function components** - Prefer over class components
- **Props destructuring** - Always destructure props
- **No array index keys** (WARN)
- **Self-closing tags** - When no children
- **No nested ternaries** - Extract to variables/components

### ✅ Import Organization (ERROR level)
- **No unresolved imports** - All imports must exist
- **No duplicate imports** - Merge duplicate imports
- **Ordered imports** - React → External → Internal → Types
- **Named exports preferred** (WARN) - Better refactoring support

### ✅ Error Prevention (ERROR level)
- **No async without await** - Catch unused async
- **Handle promises** - No floating promises
- **Require error handling** - Reject with Error objects
- **No throw literals** - Only throw Error objects

### ✅ Code Style (ERROR level)
- **Early returns** - No else after return
- **Naming conventions** - camelCase, PascalCase, UPPER_CASE
- **Boolean prefixes** - is, has, can, should, will, did
- **Curly braces** - Required for all control statements
- **Template literals** - Preferred over concatenation
- **No magic numbers** (WARN) - Extract to constants

## 📦 Installation

Add these dependencies to your `package.json`:

```json
{
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-import-resolver-typescript": "^3.6.1",
    "eslint-plugin-functional": "^6.0.0",
    "eslint-plugin-import": "^2.29.1",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.2.5"
  }
}
```

Then run:
```bash
npm install
```

## 🔧 Usage

### Lint your code:
```bash
npm run lint
```

### Auto-fix issues:
```bash
npm run lint:fix
```

### Format code with Prettier:
```bash
npm run format
```

### Check formatting:
```bash
npm run format:check
```

## 🎯 VSCode Integration

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## 🚫 Disabled Rules

Some rules are disabled for flexibility:

- **Empty interfaces** - Useful for extending types
- **Void expressions** - Arrow functions can be concise
- **Default exports** - Allowed in `App.tsx`, `main.tsx`, config files
- **Test files** - Relaxed complexity rules for tests

## 📝 Rule Overrides

### Page/Layout Files
- Default exports allowed (`*.page.tsx`, `*.layout.tsx`, `App.tsx`, `main.tsx`)

### Test Files
- `any` types allowed
- No line/function limits
- Located in `**/__tests__/**`, `**/*.test.*`, `**/*.spec.*`

### Config Files
- Default exports allowed
- CommonJS `require` allowed
- Located in `*.config.*`, `vite.config.*`, `tailwind.config.*`

## 🔍 Common Violations & Fixes

### ❌ `@typescript-eslint/no-explicit-any`
```typescript
// ❌ BAD
function getData(id: any): any {
  return data;
}

// ✅ GOOD
function getData(id: number): UserData {
  return data;
}
```

### ❌ `max-lines-per-function`
```typescript
// ❌ BAD - 60 lines in one function
function ProcessData() {
  // ... 60 lines
}

// ✅ GOOD - Extracted helpers
function ProcessData() {
  const validated = validateData(data);
  const transformed = transformData(validated);
  return saveData(transformed);
}

function validateData(data: RawData): ValidData {
  // ... validation logic
}
```

### ❌ `react-hooks/exhaustive-deps`
```typescript
// ❌ BAD - Missing dependency
useEffect(() => {
  fetchData(userId);
}, []);

// ✅ GOOD - Include all dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### ❌ `no-else-return`
```typescript
// ❌ BAD
function getStatus(value: number): string {
  if (value > 10) {
    return 'high';
  } else {
    return 'low';
  }
}

// ✅ GOOD
function getStatus(value: number): string {
  if (value > 10) return 'high';
  return 'low';
}
```

### ❌ `import/order`
```typescript
// ❌ BAD
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { User } from './types';

// ✅ GOOD
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import type { User } from './types';
```

### ❌ `@typescript-eslint/naming-convention`
```typescript
// ❌ BAD - Boolean without prefix
const active = true;
const userExists = false;

// ✅ GOOD - Proper prefixes
const isActive = true;
const hasUser = false;
```

## 🎓 Learning Resources

- [TypeScript ESLint](https://typescript-eslint.io/)
- [React Hooks ESLint](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- [Functional Programming ESLint](https://github.com/eslint-functional/eslint-plugin-functional)
- [Import Plugin](https://github.com/import-js/eslint-plugin-import)

## 🤝 Contributing

When adding new rules:
1. Update `.eslintrc.json`
2. Update this README with examples
3. Test on existing codebase
4. Document any new overrides

## ⚙️ Pre-commit Hook (Optional)

Add to `package.json`:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run format:check"
    }
  }
}
```

Install husky:
```bash
npm install --save-dev husky
npx husky install
```

---

**Philosophy**: Catch errors early, enforce consistency, maintain simplicity.
