#!/usr/bin/env node

/**
 * Simple CLI to test markdown conversion without browser
 * Usage: node scripts/test-converter.js "your markdown here"
 */

import { convertMarkdownToOutline, testConvertMarkdown } from '../utils/markdownConverter';

// Get markdown from command line arguments or use sample
const markdown =
  process.argv[2] ||
  `# Sample Document

This is a **sample** markdown document for testing.

## Features

- Bullet points
- [ ] Todo items  
- [x] Completed items

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> This is a quote
> With multiple lines

[Link example](https://example.com)`;

console.log('=== Input Markdown ===');
console.log(markdown);
console.log('\n=== Converted Outline ===');

try {
  const result = convertMarkdownToOutline(markdown, {
    convertToLogseqTodo: true,
  });
  console.log(result);
} catch (error) {
  console.error('Error:', error.message);
  console.log('\n=== Test Helper Output ===');
  const testResult = testConvertMarkdown(markdown);
  console.log(JSON.stringify(testResult, null, 2));
}
