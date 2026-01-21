import { describe, it, expect } from 'vitest';
import dedent from 'dedent';
import { convertMarkdownToOutline } from '../../markdown-converter';

describe('MarkdownConverter - Ordered List Hierarchy Regression', () => {
  it('should handle ordered list followed by unordered list with correct hierarchy and order', () => {
    const markdown = dedent`
      1. **正则提取：** 使用正则 \`/(.*) \$/\` 解析每一行。
      2. **ID 决策策略：**
      * **情况 A：解析到了 ID** -> 直接使用该 ID 作为数据库的主键（\`uuid\`）。如果数据库里已有该 ID，则执行 UPDATE；如果没有，执行 INSERT。
      * **情况 B：没解析到 ID** -> 视为新数据。数据库自动生成一个新的 UUID。`;

    const result = convertMarkdownToOutline(markdown);

    console.log('Current result:', result);

    // The result should maintain the correct order and hierarchy
    expect(result).toBe(dedent`
      - **正则提取：** 使用正则 \`/(.*) \$/\` 解析每一行。
      - **ID 决策策略：**
        - **情况 A：解析到了 ID** -> 直接使用该 ID 作为数据库的主键（\`uuid\`）。如果数据库里已有该 ID，则执行 UPDATE；如果没有，执行 INSERT。
        - **情况 B：没解析到 ID** -> 视为新数据。数据库自动生成一个新的 UUID。`);
  });

  it('should handle simple ordered list followed by unordered list', () => {
    const markdown = dedent`
      1. First item
      * Sub item A
      * Sub item B`;

    const result = convertMarkdownToOutline(markdown);

    console.log('Simple case result:', result);

    expect(result).toBe(dedent`
      - First item
        - Sub item A
        - Sub item B`);
  });

  it('should handle ordered list with multiple unordered sublists', () => {
    const markdown = dedent`
      1. Parent item 1
      * Child 1.1
      * Child 1.2
      2. Parent item 2
      * Child 2.1
      * Child 2.2`;

    const result = convertMarkdownToOutline(markdown);

    console.log('Multiple items result:', result);

    expect(result).toBe(dedent`
      - Parent item 1
        - Child 1.1
        - Child 1.2
      - Parent item 2
        - Child 2.1
        - Child 2.2`);
  });
});
