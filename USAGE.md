# Usage Guide

This guide explains how to use the markdown conversion functionality without opening the web interface.

## Quick Start

### 1. Using the CLI Script

The easiest way to test markdown conversion is via the CLI script:

```bash
# Test with sample markdown
npm run test-converter

# Test with your own markdown
npm run test-converter "# Hello World\n\nThis is **bold** text."
```

### 2. Using in Your Code

Import the functions directly:

```typescript
import {
  convertMarkdownToOutline,
  testConvertMarkdown,
  parseMarkdown,
} from './utils/markdown-converter';

// Basic conversion
const markdown = '# Title\n\nSome content';
const outline = convertMarkdownToOutline(markdown);
console.log(outline);

// With options
const outlineWithTodos = convertMarkdownToOutline(markdown, {
  convertToLogseqTodo: true,
  removeHeaderMarkers: true,
});

// Safe conversion with error handling
const result = testConvertMarkdown(markdown);
if (result.success) {
  console.log(result.result);
} else {
  console.error('Error:', result.error);
}
```

## Available Functions

### `convertMarkdownToOutline(markdown, options?)`

Main function that converts markdown string to outline format.

**Parameters:**

- `markdown: string` - The markdown text to convert
- `options?: ConvertMarkdownOptions` - Optional configuration

**Options:**

- `removeHeaderMarkers?: boolean` - Remove # markers from headings (default: false)
- `ignoreYamlFrontmatter?: boolean` - Skip YAML frontmatter (default: true)
- `convertToLogseqTodo?: boolean` - Convert [ ] and [x] to TODO/DONE (default: false)

**Returns:** `string` - The converted outline

### `testConvertMarkdown(markdown, options?)`

Safe wrapper that returns an object with success/error information.

**Returns:**

```typescript
{
  success: boolean;
  result?: string;
  error?: string;
}
```

### `parseMarkdown(markdown)`

Parse markdown to AST for debugging or advanced usage.

**Returns:** `MarkdownNode` - The parsed AST

## JavaScript String Syntax

For multi-line strings in JavaScript/TypeScript, you can use template literals with backticks, and for better formatting, use the `dedent` package:

```javascript
import dedent from 'dedent';

const markdown = dedent`
  # Title

  This is a multi-line
  markdown document.

  - Item 1
  - Item 2
    - Subitem`;
```

The `dedent` function removes the common leading whitespace from all lines, making your code more readable while keeping the actual markdown content clean.

## Examples

### Basic Markdown

```javascript
import dedent from 'dedent';

const markdown = dedent`
  # Hello World

  This is **bold** and *italic* text.`;

const result = convertMarkdownToOutline(markdown);
// Output:
// - # Hello World
// - This is **bold** and *italic* text.
```

### Lists with Sub-items

```javascript
import dedent from 'dedent';

const markdown = dedent`
  - Parent 1
    - Child 1.1
    - Child 1.2
  - Parent 2`;

const result = convertMarkdownToOutline(markdown);
// Output:
// - Parent 1
//   - Child 1.1
//   - Child 1.2
// - Parent 2
```

### TODO Conversion

```javascript
import dedent from 'dedent';

const markdown = dedent`
  - [ ] Task to do
  - [x] Completed task`;

const result = convertMarkdownToOutline(markdown, {
  convertToLogseqTodo: true,
});
// Output:
// - TODO Task to do
// - DONE Completed task
```

### Code Blocks and Quotes

````javascript
import dedent from 'dedent';

const markdown = dedent`
  > This is a quote
  > Multiple lines

  \`\`\`javascript
  const x = 1;
  console.log(x);
  \`\`\``;

const result = convertMarkdownToOutline(markdown);
// Output:
// - > This is a quote
// > Multiple lines
// - ```javascript
//     const x = 1;
//     console.log(x);
//   ```
````

### Lists with Sub-items

```javascript
const markdown = `- Parent 1
  - Child 1.1
  - Child 1.2
- Parent 2`;

const result = convertMarkdownToOutline(markdown);
// Output:
// - Parent 1
//   - Child 1.1
//   - Child 1.2
// - Parent 2
```

### TODO Conversion

```javascript
const markdown = `- [ ] Task to do
- [x] Completed task`;

const result = convertMarkdownToOutline(markdown, {
  convertToLogseqTodo: true,
});
// Output:
// - TODO Task to do
// - DONE Completed task
```

### Code Blocks and Quotes

````javascript
const markdown = `> This is a quote
> Multiple lines

\`\`\`javascript
const x = 1;
console.log(x);
\`\`\``;

const result = convertMarkdownToOutline(markdown);
// Output:
// - > This is a quote
// > Multiple lines
// - ```javascript
//     const x = 1;
//     console.log(x);
//   ```
````

## Testing

Run the test suite to verify functionality:

```bash
# Run all tests
npm test

# Run specific test file
npx vitest run utils/tests/converter/basic.test.ts

# Run with coverage
npm run test:coverage
```
