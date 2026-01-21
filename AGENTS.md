# AGENTS.md

This file provides guidelines for AI agents working in this repository.

## Project Overview

A Next.js 14 application for converting Markdown to Logseq outline format with offline-first PWA support. The app uses React 18, TypeScript, and follows modern web development practices.

## Build/Lint/Test Commands

### Core Commands

```bash
# Development
pnpm dev              # Start development server at http://localhost:3000

# Build
pnpm build            # Build for production (output: standalone)
pnpm start            # Start production server (use after build)

# Linting
pnpm lint             # Run Next.js linting

# Testing
pnpm test             # Run tests with Vitest (watch mode by default)
pnpm vitest run        # Run tests once and exit
pnpm vitest run --coverage    # Run tests with coverage report

# Run single test file
pnpm vitest run utils/tests/convertToOutline.test.ts

# Run single test case (using test name filter)
pnpm vitest run -t "should convert simple paragraph"

# Prepare git hooks
pnpm prepare          # Install husky git hooks
```

### Testing Framework

- **Vitest** for unit/integration tests
- **@testing-library/react** for React component testing
- **jsdom** for DOM environment
- **@vitest/coverage-v8** for coverage reporting

### Test File Patterns

- Location: `**/*.test.{ts,tsx}`
- Naming: `*.test.ts` or `*.test.tsx`
- Use `describe`, `it`, `expect` from `vitest`

### Testing Best Practices

- **String comparison**: Use `expect(str).toBe(expected)` for exact string matching, **NEVER use `toContain`** for string comparisons
- **Test organization**: Before writing tests, check if similar tests already exist to avoid duplication
- **Test file placement**: Always determine the correct test file location - tests should be co-located with source files in `utils/tests/` or appropriately organized. **Do not create test files randomly**

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** in `tsconfig.json`
- Use explicit types for function parameters and return types
- Use `interface` for object types, `type` for unions/primitives
- Import types using `import type { TypeName }`

### Imports

```typescript
// Standard imports (alphabetical order within groups)
import { useState, useEffect } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';

// Types
import type { MarkdownNode } from '../utils/convertToOutline';

// Relative imports for same-level files
import { convertToOutline } from '../utils/convertToOutline';

// Alias path configuration: @/* maps to ./*
import { cn } from '@/lib/utils';
```

### Naming Conventions

- **Variables/functions**: camelCase (`convertToOutline`, `markdownNode`)
- **Constants**: UPPER_SNAKE_CASE for config constants, camelCase for others
- **Types/interfaces**: PascalCase (`MarkdownNode`, `ConvertOptions`)
- **Files**: kebab-case for utilities (`convert-to-outline.ts`), PascalCase for components (`Button.tsx`)
- **React Hooks**: prefix with `use` (`useMarkdownToOutline`)

### Formatting (Prettier)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

Prettier plugin: `prettier-plugin-tailwindcss` is used.

### Component Patterns

```typescript
// Functional component with TypeScript
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Hooks at top
  const [state, setState] = useState(initialValue);

  // Early returns for conditions
  if (!isReady) return null;

  // Main logic
  return <JSX />;
}

// For simple utility components, use arrow functions
export const ComponentName: React.FC<Props> = ({ children }) => {
  return <div>{children}</div>;
};
```

### Tailwind CSS

- Use `cn()` utility for conditional classes (`lib/utils.ts`)
- Follow `prettier-plugin-tailwindcss` ordering (width, padding, colors, etc.)
- Use `clsx` and `tailwind-merge` for class handling

### Error Handling

```typescript
try {
  // operation
} catch (error) {
  console.error('Descriptive message:', error);
  setError(`User-friendly message: ${error instanceof Error ? error.message : String(error)}`);
}
```

- Always log errors with descriptive messages
- Provide user-friendly error messages in UI
- Use `instanceof Error` for type narrowing

### Performance Considerations

- Use `useMemo` and `useCallback` for expensive computations
- Implement debouncing for input handlers (300ms default)
- Cache repetitive operations (e.g., `indentCache` in convertToOutline.ts)
- Use early returns to avoid unnecessary processing

### React Best Practices

- Use functional components with hooks
- Keep components focused and small
- Extract reusable logic into custom hooks
- Use `useEffect` with proper dependency arrays
- Prefer composition over prop drilling

### Git Hooks (Husky)

- Pre-commit: Runs `vitest --run` on staged `.ts` and `.tsx` files
- Ensure tests pass before committing

## Directory Structure

```
├── app/                 # Next.js App Router pages
├── components/          # React components (optional, organized by feature)
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── utils/               # Core utilities and converters
│   └── tests/           # Test files (co-located with source)
├── public/              # Static assets
└── scripts/             # Build/utility scripts
```

## Key Dependencies

- **React 18** with TypeScript
- **Next.js 14** (App Router, standalone output)
- **Radix UI** for accessible components
- **Tailwind CSS** for styling
- **Vitest** for testing
- **unified/remark** for Markdown parsing

## Common Tasks

### Adding a New Feature

1. Create utility functions in `utils/` or `lib/`
2. Create custom hook in `hooks/` if state/logic needed
3. Create components in `components/`
4. Add tests in `utils/tests/` or co-located
5. Run `pnpm test` to verify
6. Run `pnpm build` to ensure production build works

### Debugging Tests

```bash
pnpm vitest run utils/tests/file.test.ts --reporter=verbose
```

### Updating Dependencies

```bash
pnpm update           # Update to latest within semver
pnpm add package@ver  # Add specific version
```
