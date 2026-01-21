import { describe, it, expect } from 'vitest';
import dedent from 'dedent';
import { convertMarkdownToOutline } from '../../markdown-converter';

describe('MarkdownConverter - Lists', () => {
  it('should convert simple unordered lists', () => {
    const markdown = dedent`
      - Item 1
      - Item 2
      - Item 3`;

    const result = convertMarkdownToOutline(markdown);
    const expected = dedent`
      - Item 1
      - Item 2
      - Item 3`;

    expect(result).toBe(expected);
  });

  it('should convert unordered lists with nested items', () => {
    const markdown = dedent`
      - Parent 1
        - Child 1.1
        - Child 1.2
      - Parent 2
        - Child 2.1`;

    const result = convertMarkdownToOutline(markdown);
    const expected = dedent`
      - Parent 1
        - Child 1.1
        - Child 1.2
      - Parent 2
        - Child 2.1`;

    expect(result).toBe(expected);
  });

  it('should convert ordered lists', () => {
    const markdown = dedent`
      1. First item
      2. Second item
      3. Third item`;

    const result = convertMarkdownToOutline(markdown);
    const expected = dedent`
      - First item
      - Second item
      - Third item`;

    expect(result).toBe(expected);
  });

  it('should convert ordered lists with sublists', () => {
    const markdown = dedent`
      1. First item
         - Sub item 1.1
         - Sub item 1.2
      2. Second item
         - Sub item 2.1`;

    const result = convertMarkdownToOutline(markdown);
    const expected = dedent`
      - First item
        - Sub item 1.1
        - Sub item 1.2
      - Second item
        - Sub item 2.1`;

    expect(result).toBe(expected);
  });

  it('should handle mixed ordered and unordered lists', () => {
    const markdown = dedent`
      - Unordered item 1
      - Unordered item 2
      1. Ordered item 1
      2. Ordered item 2`;

    const result = convertMarkdownToOutline(markdown);
    expect(result).toContain('- Unordered item 1');
    expect(result).toContain('- Unordered item 2');
    expect(result).toContain('- Ordered item 1');
    expect(result).toContain('- Ordered item 2');
  });

  it('should handle list items with multiple paragraphs', () => {
    const markdown = dedent`
      - Item 1
        This is a second paragraph for item 1.
        
      - Item 2
        This is a second paragraph for item 2.`;

    const result = convertMarkdownToOutline(markdown);
    expect(result).toContain('- Item 1');
    expect(result).toContain('  - This is a second paragraph for item 1.');
    expect(result).toContain('- Item 2');
    expect(result).toContain('  - This is a second paragraph for item 2.');
  });
});
