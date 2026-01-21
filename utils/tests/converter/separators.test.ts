import { describe, it, expect } from 'vitest';
import dedent from 'dedent';
import { convertMarkdownToOutline } from '../../markdown-converter';

describe('MarkdownConverter - Separators', () => {
  it('should convert thematic breaks (---) to bullet points', () => {
    const markdown = dedent`
      ---
      title: Test
      ---

      # Document Title
      Content here.`;

    const result = convertMarkdownToOutline(markdown);
    const expected = dedent`
      - ---
      - ## title: Test
      - ---
      - # Document Title
      - Content here.`;

    expect(result).toBe(expected);
  });

  it('should convert single thematic break to bullet point', () => {
    const markdown = dedent`
      # First Section
      Content 1
      
      ---
      
      # Second Section
      Content 2`;

    const result = convertMarkdownToOutline(markdown);
    const expected = dedent`
      - # First Section
      - Content 1
      - ---
      - # Second Section
      - Content 2`;

    expect(result).toBe(expected);
  });
});
