import { describe, it, expect } from 'vitest';
import dedent from 'dedent';
import { convertMarkdownToOutline } from '../../markdownConverter';

describe('MarkdownConverter - Complex Documents', () => {
  it('should handle complex formatting', () => {
    const markdown = dedent`
      # **Bold Title**

      This has *italic* text and \`code\` inline.

      - [ ] Todo item
      - [x] Done item

      > A quote here

      [Link text](https://example.com)`;

    const result = convertMarkdownToOutline(markdown, {
      convertToLogseqTodo: true,
    });

    expect(result).toContain('- # **Bold Title**');
    expect(result).toContain('- This has *italic* text and `code` inline.');
    expect(result).toContain('- TODO Todo item');
    expect(result).toContain('- DONE Done item');
    expect(result).toContain('- > A quote here');
    expect(result).toContain('- [Link text](https://example.com)');
  });

  it('should handle hierarchical document structure', () => {
    const markdown = dedent`
      # Document Title

      ## Section 1
      Content for section 1.

      ### Subsection 1.1
      - List item 1.1
      - List item 1.2

      ## Section 2
      More content here.

      \`\`\`javascript
      const example = "code";
      \`\`\`

      # Another Top Level Section
      Final content.`;

    const result = convertMarkdownToOutline(markdown);

    expect(result).toContain('- # Document Title');
    expect(result).toContain('  - ## Section 1');
    expect(result).toContain('    - Content for section 1.');
    expect(result).toContain('  - ### Subsection 1.1');
    expect(result).toContain('    - List item 1.1');
    expect(result).toContain('    - List item 1.2');
    expect(result).toContain('  - ## Section 2');
    expect(result).toContain('    - More content here.');
    expect(result).toContain('    - ```javascript');
    expect(result).toContain('- # Another Top Level Section');
    expect(result).toContain('  - Final content.');
  });

  it('should handle mixed content types', () => {
    const markdown = dedent`
      # Mixed Content Demo

      Here's some text with **formatting** and a [link](https://example.com).

      ## Lists
      - Regular item
      - [ ] Todo item
      - [x] Completed item

      ## Code
      \`\`\`python
      def hello():
          print("Hello")
      \`\`\`

      ## Quotes
      > "To be or not to be"
      > - Shakespeare

      ## Combined
      - Item with **bold**
      - Item with \`code\`
      - Item with [link](https://test.com)`;

    const result = convertMarkdownToOutline(markdown, {
      convertToLogseqTodo: true,
    });

    // Should contain all the main elements
    expect(result).toContain('- # Mixed Content Demo');
    expect(result).toContain(
      "  - Here's some text with **formatting** and a [link](https://example.com)."
    );
    expect(result).toContain('- ## Lists');
    expect(result).toContain('  - Regular item');
    expect(result).toContain('  - TODO Todo item');
    expect(result).toContain('  - DONE Completed item');
    expect(result).toContain('- ## Code');
    expect(result).toContain('  - ```python');
    expect(result).toContain('- ## Quotes');
    expect(result).toContain('  - > "To be or not to be"');
    expect(result).toContain('- ## Combined');
    expect(result).toContain('  - Item with **bold**');
    expect(result).toContain('  - Item with `code`');
    expect(result).toContain('  - Item with [link](https://test.com)');
  });
});
