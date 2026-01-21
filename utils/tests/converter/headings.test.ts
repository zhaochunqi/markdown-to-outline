import { describe, it, expect } from 'vitest';
import dedent from 'dedent';
import { convertMarkdownToOutline } from '../../markdown-converter';

describe('MarkdownConverter - Headings and Paragraphs', () => {
  it('should convert markdown with headings', () => {
    const markdown = dedent`
      # Main Title
      ## Subtitle

      Some content here`;

    const result = convertMarkdownToOutline(markdown);
    expect(result).toContain('- # Main Title');
    expect(result).toContain('- ## Subtitle');
    expect(result).toContain('- Some content here');
  });

  it('should handle different heading levels', () => {
    const markdown = dedent`
      # Level 1
      ## Level 2
      ### Level 3
      #### Level 4
      ##### Level 5
      ###### Level 6`;

    const result = convertMarkdownToOutline(markdown);
    expect(result).toContain('- # Level 1');
    expect(result).toContain('- ## Level 2');
    expect(result).toContain('- ### Level 3');
    expect(result).toContain('- #### Level 4');
    expect(result).toContain('- ##### Level 5');
    expect(result).toContain('- ###### Level 6');
  });

  it('should handle paragraphs with mixed formatting', () => {
    const markdown = dedent`
      This is a simple paragraph.

      This paragraph has **bold** and *italic* text.
      
      This one has \`inline code\` and a [link](https://example.com).`;

    const result = convertMarkdownToOutline(markdown);
    expect(result).toContain('- This is a simple paragraph.');
    expect(result).toContain('- This paragraph has **bold** and *italic* text.');
    expect(result).toContain('- This one has `inline code` and a [link](https://example.com).');
  });

  it('should handle paragraph hierarchy under headings', () => {
    const markdown = dedent`
      # Main Section
      This should be indented under the main section.
      
      ## Subsection
      This should be indented under the subsection.`;

    const result = convertMarkdownToOutline(markdown);
    expect(result).toContain('- # Main Section');
    expect(result).toContain('  - This should be indented under the main section.');
    expect(result).toContain('- ## Subsection');
    expect(result).toContain('  - This should be indented under the subsection.');
  });
});
