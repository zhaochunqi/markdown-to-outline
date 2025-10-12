# Technology Stack

## Framework & Runtime
- **Next.js 14.2.16** - React framework with App Router
- **React 18** - UI library with hooks and functional components
- **TypeScript 5** - Type-safe JavaScript with strict mode enabled
- **Node.js** - Runtime environment (version 20+ required)

## Styling & UI
- **Tailwind CSS 3.4.17** - Utility-first CSS framework with custom design system
- **shadcn/ui** - Component library built on Radix UI primitives
- **Radix UI** - Headless UI components for accessibility
- **Lucide React** - Icon library
- **next-themes** - Dark/light theme support
- **CSS Variables** - Custom properties for theming

## Markdown Processing
- **unified** - Markdown processing pipeline
- **remark-parse** - Markdown parser
- **gray-matter** - Front matter extraction
- **unist-util-visit** - AST traversal utilities

## Development Tools
- **pnpm** - Package manager (preferred)
- **Prettier** - Code formatting with Tailwind plugin
- **ESLint** - Linting (disabled during builds for flexibility)
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## Build Configuration
- **Standalone output** - Optimized for containerized deployments
- **Docker support** - Dockerfile included for containerization
- **Build optimizations** - Parallel builds, webpack workers enabled
- **Image optimization** - Unoptimized for static deployment compatibility

## Common Commands

```bash
# Development
pnpm dev              # Start development server on localhost:3000
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Package management
pnpm install          # Install dependencies
pnpm add <package>    # Add new dependency
pnpm add -D <package> # Add dev dependency

# Docker
docker build -t markdown-converter .
docker run -p 3000:3000 markdown-converter
```

## Path Aliases
- `@/*` - Root directory alias for clean imports
- `@/components` - UI components
- `@/lib` - Utility libraries
- `@/hooks` - Custom React hooks
- `@/utils` - Helper functions