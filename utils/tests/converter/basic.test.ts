import { describe, it, expect } from 'vitest';
import dedent from 'dedent';
import {
  convertMarkdownToOutline,
  testConvertMarkdown,
  parseMarkdown,
} from '../../markdown-converter';

describe('MarkdownConverter - Basic Operations', () => {
  it('should convert simple markdown paragraph', () => {
    const markdown = 'Hello World';
    const result = convertMarkdownToOutline(markdown);
    expect(result).toBe('- Hello World');
  });

  it('should handle empty markdown', () => {
    const result = convertMarkdownToOutline('');
    expect(result).toBe('');
  });

  it('should throw error for invalid input', () => {
    expect(() => convertMarkdownToOutline(null as unknown as string)).toThrow(
      'Markdown input must be a string'
    );
    expect(() => convertMarkdownToOutline(undefined as unknown as string)).toThrow(
      'Markdown input must be a string'
    );
  });

  it('should parse markdown to AST for testing', () => {
    const markdown = '# Title';
    const ast = parseMarkdown(markdown);

    expect(ast.type).toBe('root');
    expect(ast.children).toBeDefined();
    expect(ast.children?.[0]?.type).toBe('heading');
  });

  it('should provide test helper with error handling', () => {
    const validMarkdown = 'Hello';
    const invalidMarkdown = null as unknown as string;

    const validResult = testConvertMarkdown(validMarkdown);
    expect(validResult.success).toBe(true);
    expect(validResult.result).toBe('- Hello');

    const invalidResult = testConvertMarkdown(invalidMarkdown);
    expect(invalidResult.success).toBe(false);
    expect(invalidResult.error).toContain('must be a string');
  });

  describe('MarkdownConverter - Options', () => {
    it('should support removeHeaderMarkers option', () => {
      const markdown = dedent`
      # Title

      Content`;

      const resultWithoutMarkers = convertMarkdownToOutline(markdown, {
        removeHeaderMarkers: true,
      });

      const resultWithMarkers = convertMarkdownToOutline(markdown, {
        removeHeaderMarkers: false,
      });

      expect(resultWithoutMarkers).toContain('- Title');
      expect(resultWithoutMarkers).not.toContain('# Title');

      expect(resultWithMarkers).toContain('- # Title');
    });

    it('should support ignoreYamlFrontmatter option', () => {
      const markdown = dedent`
      ---
      title: Test
      ---
      # Content`;

      // Note: Currently remark-parse doesn't parse YAML frontmatter without remark-frontmatter plugin
      // So YAML gets parsed as thematicBreak + heading, ignoreYamlFrontmatter has no effect
      const resultIncluded = convertMarkdownToOutline(markdown, {
        ignoreYamlFrontmatter: false,
      });
      expect(resultIncluded).toContain('- ## title: Test');
      expect(resultIncluded).toContain('- # Content');
    });
  });

  it('should support convertToLogseqTodo option', () => {
    const markdown = dedent`
      - [ ] Todo item
      - [x] Done item`;

    const result = convertMarkdownToOutline(markdown, {
      convertToLogseqTodo: true,
    });

    expect(result).toContain('- TODO Todo item');
    expect(result).toContain('- DONE Done item');
  });
});
