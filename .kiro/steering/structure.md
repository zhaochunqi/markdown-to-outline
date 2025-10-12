# Project Structure

## Directory Organization

```
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page (main converter interface)
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui component library
│   └── theme-provider.tsx # Theme context provider
├── hooks/                # Custom React hooks
│   ├── use-mobile.tsx    # Mobile detection hook
│   ├── use-toast.ts      # Toast notification hook
│   └── useMarkdownToOutline.ts # Core markdown processing hook
├── lib/                  # Utility libraries
│   └── utils.ts          # Common utility functions (cn, etc.)
├── utils/                # Business logic utilities
│   └── convertToOutline.ts # Markdown AST to outline conversion
├── styles/               # Additional stylesheets
├── public/               # Static assets (images, icons)
└── .kiro/                # Kiro IDE configuration
    └── steering/         # AI assistant guidance files
```

## File Naming Conventions

- **Components**: PascalCase for React components (`ThemeProvider.tsx`)
- **Hooks**: camelCase with `use` prefix (`useMarkdownToOutline.ts`)
- **Utilities**: camelCase for functions (`convertToOutline.ts`)
- **Pages**: lowercase for App Router (`page.tsx`, `layout.tsx`)
- **Types**: PascalCase interfaces, often co-located with implementation

## Import Patterns

- Use path aliases (`@/` prefix) for all internal imports
- Group imports: external libraries first, then internal modules
- Prefer named exports over default exports for utilities
- Use `'use client'` directive for client-side components

## Component Architecture

- **Client Components**: Interactive UI with state management
- **Server Components**: Static rendering where possible
- **Custom Hooks**: Encapsulate complex state logic and side effects
- **Utility Functions**: Pure functions for data transformation

## Key Architectural Patterns

- **Separation of Concerns**: UI components separate from business logic
- **Custom Hooks**: Complex state management abstracted into reusable hooks
- **Type Safety**: Comprehensive TypeScript interfaces for all data structures
- **Error Boundaries**: Graceful error handling in markdown processing
- **Real-time Processing**: Immediate feedback using React's useEffect

## Configuration Files

- `components.json` - shadcn/ui configuration
- `tailwind.config.ts` - Tailwind CSS customization
- `tsconfig.json` - TypeScript compiler options with path mapping
- `next.config.mjs` - Next.js build configuration
- `.prettierrc` - Code formatting rules