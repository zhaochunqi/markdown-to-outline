import { describe, it, expect } from 'vitest';
import dedent from 'dedent';
import { convertMarkdownToOutline } from '../../markdown-converter';

describe('MarkdownConverter - Complex Mixed Structure', () => {
  it('should handle complex mixed structure with heading, paragraph, ordered and unordered lists', () => {
    const markdown = dedent`
      #### 2.3 导入逻辑 (Markdown -> Database)

      这是整个系统中最关键的"唯一一次"导入，或者是从外部编辑器修改后的重载。

      1. **正则提取：** 使用正则 \`/(.*) \$/\` 解析每一行。
      2. **ID 决策策略：**
      * **情况 A：解析到了 ID** -> 直接使用该 ID 作为数据库的主键（\`uuid\`）。如果数据库里已有该 ID，则执行 UPDATE；如果没有，执行 INSERT。
      * **情况 B：没解析到 ID** -> 视为新数据。数据库自动生成一个新的 UUID。`;

    const result = convertMarkdownToOutline(markdown);

    console.log('Complex structure result:', result);

    // Expected correct hierarchy
    expect(result).toBe(dedent`
      - #### 2.3 导入逻辑 (Markdown -> Database)
        - 这是整个系统中最关键的"唯一一次"导入，或者是从外部编辑器修改后的重载。
        - **正则提取：** 使用正则 \`/(.*) \$/\` 解析每一行。
        - **ID 决策策略：**
          - **情况 A：解析到了 ID** -> 直接使用该 ID 作为数据库的主键（\`uuid\`）。如果数据库里已有该 ID，则执行 UPDATE；如果没有，执行 INSERT。
          - **情况 B：没解析到 ID** -> 视为新数据。数据库自动生成一个新的 UUID。`);
  });
});
