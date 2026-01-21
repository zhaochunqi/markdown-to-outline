import { describe, it, expect } from 'vitest';
import { convertToOutline, MarkdownNode } from '../convertToOutline';

describe('Ordered Lists with Code Blocks', () => {
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
                  children: [
                    { type: 'strong', children: [{ type: 'text', value: '第一步：获取引用集合' }] },
                  ],
                },
                {
                  type: 'code',
                  lang: 'sql',
                  value:
                    '-- 找出所有作为 target 被引用的 block_uuid\nSELECT DISTINCT target_uuid FROM refs;\n',
                },
              ],
            },
          ],
        },
      ],
    };

    const result = convertToOutline(root);

    // Should create separate bullet points
    const lines = result.split('\n');
    expect(lines.length).toBeGreaterThan(1);
    expect(lines[0]).toBe('- **第一步：获取引用集合**');
    expect(result).toContain('- ```sql');
    expect(result).toContain('-- 找出所有作为 target 被引用的 block_uuid');
    expect(result).toContain('SELECT DISTINCT target_uuid FROM refs');
  });

  it('should handle ordered list with multiple items containing code blocks', () => {
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
                  lang: 'javascript',
                  value: 'console.log("first");',
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
                  lang: 'python',
                  value: 'print("second")',
                },
              ],
            },
          ],
        },
      ],
    };

    const result = convertToOutline(root);

    expect(result).toContain('- First item');
    expect(result).toContain('```javascript');
    expect(result).toContain('console.log("first");');
    expect(result).toContain('- Second item');
    expect(result).toContain('```python');
    expect(result).toContain('print("second")');

    // Verify that items are properly separated (not combined into single bullet points)
    const lines = result.split('\n');
    const firstItemIndex = lines.findIndex(line => line === '- First item');
    const secondItemIndex = lines.findIndex(line => line === '- Second item');

    expect(firstItemIndex).toBeGreaterThanOrEqual(0);
    expect(secondItemIndex).toBeGreaterThanOrEqual(0);
    expect(secondItemIndex).toBeGreaterThan(firstItemIndex);
  });

  it('should handle ordered list item with multiple code blocks', () => {
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
                  children: [{ type: 'text', value: 'Item with multiple code blocks' }],
                },
                {
                  type: 'code',
                  lang: 'js',
                  value: 'const x = 1;',
                },
                {
                  type: 'code',
                  lang: 'py',
                  value: 'y = 2',
                },
              ],
            },
          ],
        },
      ],
    };

    const result = convertToOutline(root);

    expect(result).toContain('- Item with multiple code blocks');
    expect(result).toContain('```js');
    expect(result).toContain('const x = 1;');
    expect(result).toContain('```py');
    expect(result).toContain('y = 2');

    // Verify they are separate bullet points
    const lines = result.split('\n');
    expect(lines.some(line => line === '- Item with multiple code blocks')).toBe(true);
    expect(lines.some(line => line.includes('```js'))).toBe(true);
    expect(lines.some(line => line.includes('```py'))).toBe(true);
  });

  it('should handle ordered list item with mixed content types', () => {
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
                  children: [{ type: 'text', value: 'Mixed content item' }],
                },
                {
                  type: 'code',
                  lang: 'sql',
                  value: 'SELECT * FROM table;',
                },
                {
                  type: 'paragraph',
                  children: [{ type: 'text', value: 'Additional paragraph' }],
                },
              ],
            },
          ],
        },
      ],
    };

    const result = convertToOutline(root);

    expect(result).toContain('- Mixed content item');
    expect(result).toContain('```sql');
    expect(result).toContain('SELECT * FROM table;');
    expect(result).toContain('Additional paragraph');

    // Additional paragraph should be properly indented as a child
    const lines = result.split('\n');
    expect(lines.some(line => line.includes('- Mixed content item'))).toBe(true);
    expect(lines.some(line => line.includes('```sql'))).toBe(true);
    expect(lines.some(line => line.includes('Additional paragraph'))).toBe(true);
  });

  it('should handle unordered list items with code blocks correctly', () => {
    const root: MarkdownNode = {
      type: 'root',
      children: [
        {
          type: 'list',
          ordered: false,
          children: [
            {
              type: 'listItem',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', value: 'Unordered item' }],
                },
                {
                  type: 'code',
                  lang: 'bash',
                  value: 'echo "hello"',
                },
              ],
            },
          ],
        },
      ],
    };

    const result = convertToOutline(root);

    expect(result).toContain('- Unordered item');
    expect(result).toContain('```bash');
    expect(result).toContain('echo "hello"');

    // Verify they are separate bullet points
    const lines = result.split('\n');
    expect(lines.some(line => line === '- Unordered item')).toBe(true);
    expect(lines.some(line => line.includes('```bash'))).toBe(true);
  });

  it('should handle empty code blocks in list items', () => {
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
                  lang: '',
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
    expect(result).toContain('```'); // Empty code block uses ``` not ````

    // Verify they are separate bullet points
    const lines = result.split('\n');
    expect(lines.some(line => line === '- Item with empty code')).toBe(true);
    expect(lines.some(line => line.includes('```'))).toBe(true);
  });
});
