import { describe, it, expect } from 'vitest';
import { convertToOutline, MarkdownNode } from '../../convertToOutline';

describe('Converter - Ordered Lists with Code Blocks (AST Level)', () => {
  it('should convert ordered list item with code block as separate bullet points', () => {
    const root: MarkdownNode = {
      type: 'root',
      children: [
        {
          type: 'list',
          ordered: true,
          children: [
            {
              type: 'listItem',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', value: 'Item 1' }],
                },
                {
                  type: 'code',
                  lang: 'js',
                  value: 'console.log("hello");',
                },
              ],
            },
          ],
        },
      ],
    };

    const result = convertToOutline(root);
    expect(result).toContain('- Item 1');
    expect(result).toContain('```js');
    expect(result).toContain('console.log("hello");');
  });

  it('should handle multiple ordered list items with code blocks', () => {
    const root: MarkdownNode = {
      type: 'root',
      children: [
        {
          type: 'list',
          ordered: true,
          children: [
            {
              type: 'listItem',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', value: 'First item' }],
                },
                {
                  type: 'code',
                  lang: 'py',
                  value: 'print("Python code")',
                },
              ],
            },
            {
              type: 'listItem',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', value: 'Second item' }],
                },
                {
                  type: 'code',
                  lang: 'java',
                  value: 'System.out.println("Java code");',
                },
              ],
            },
          ],
        },
      ],
    };

    const result = convertToOutline(root);
    expect(result).toContain('- First item');
    expect(result).toContain('- Second item');
    expect(result).toContain('```py');
    expect(result).toContain('print("Python code")');
    expect(result).toContain('```java');
    expect(result).toContain('System.out.println("Java code");');
  });

  it('should handle empty code blocks in ordered lists', () => {
    const root: MarkdownNode = {
      type: 'root',
      children: [
        {
          type: 'list',
          ordered: true,
          children: [
            {
              type: 'listItem',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', value: 'Item with empty code' }],
                },
                {
                  type: 'code',
                  lang: 'bash',
                  value: '',
                },
              ],
            },
          ],
        },
      ],
    };

    const result = convertToOutline(root);
    expect(result).toContain('- Item with empty code');
    expect(result).toContain('```bash');
  });
});
