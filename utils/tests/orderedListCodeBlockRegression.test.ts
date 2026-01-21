import { describe, it, expect } from 'vitest';
import { convertToOutline, MarkdownNode } from '../convertToOutline';

describe('Order List Code Block Regression Tests', () => {
  it('should convert ordered list items with code blocks into separate bullet points', () => {
    // Regression test for the specific issue where ordered list items containing code blocks
    // were incorrectly merged into a single code block bullet point instead of creating
    // separate bullet points for the list text and code block.
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

    // Expected behavior: should create two separate bullet points
    // 1. "- **第一步：获取引用集合**"
    // 2. "- ```sql\n    -- 找出所有作为 target 被引用的 block_uuid\n    SELECT DISTINCT target_uuid FROM refs;\n  ```"

    const lines = result.split('\n');

    // Should have the first bullet point with the formatted text
    expect(result).toContain('- **第一步：获取引用集合**');

    // Should have the code block as a separate bullet point
    expect(result).toContain('- ```sql');
    expect(result).toContain('-- 找出所有作为 target 被引用的 block_uuid');
    expect(result).toContain('SELECT DISTINCT target_uuid FROM refs');

    // Verify they are separate (not combined into one bullet point)
    expect(lines.some(line => line === '- **第一步：获取引用集合**')).toBe(true);
    expect(lines.some(line => line.includes('```sql'))).toBe(true);

    // The first line should be the formatted text, not the code block
    expect(lines[0]).toBe('- **第一步：获取引用集合**');

    // Should NOT be the old incorrect behavior where everything was combined into one code block
    expect(lines[0]).not.toContain('```');

    console.log('Fixed behavior:', result);
  });
});
