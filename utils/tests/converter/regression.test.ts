import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import dedent from 'dedent';
import { convertToOutline, type MarkdownNode } from '../../convert-to-outline';

describe('Converter - Regression Tests', () => {
  it('should handle blockquote bug fix (Sputnik moment example)', () => {
    const input = dedent`
    简言之：
    > **"斯普特尼克时刻" = 危机感 + 觉醒 + 全面改革的起点**。`;

    const expected = dedent`
    - 简言之：
    - > **"斯普特尼克时刻" = 危机感 + 觉醒 + 全面改革的起点**。`;

    const processor = unified().use(remarkParse);
    const tree = processor.parse(input);
    const converted = convertToOutline(tree as MarkdownNode);

    expect(converted).toBe(expected);
  });

  it('should nest a list under an introductory paragraph ending with a colon', () => {
    const input = dedent`
    ## 1. 问题背景

    这个项目是一个浏览器插件。插件会在用户浏览网页时向页面注入 content script，用来在搜索结果页旁边显示 Logseq 内容，以及提供 Quick Capture 浮动按钮。

    用户反馈的风险是：

    - 插件可能因为 Tailwind 或 CSS 的原因，导致正常网站显示异常。
    - 需要查清楚到底是哪类样式影响了宿主网站。
    - 修复前需要有一份可复盘文档，说明调查和修复思路。

    这里的“宿主网站”指用户正在访问的普通网页，例如 Google、DuckDuckGo、Bing、任意文章页等。浏览器插件的 content script 与这些网页共处同一个页面环境时，如果样式没有隔离，就可能互相影响。`;

    const expected = dedent`
    - ## 1. 问题背景
      - 这个项目是一个浏览器插件。插件会在用户浏览网页时向页面注入 content script，用来在搜索结果页旁边显示 Logseq 内容，以及提供 Quick Capture 浮动按钮。
      - 用户反馈的风险是：
        - 插件可能因为 Tailwind 或 CSS 的原因，导致正常网站显示异常。
        - 需要查清楚到底是哪类样式影响了宿主网站。
        - 修复前需要有一份可复盘文档，说明调查和修复思路。
      - 这里的“宿主网站”指用户正在访问的普通网页，例如 Google、DuckDuckGo、Bing、任意文章页等。浏览器插件的 content script 与这些网页共处同一个页面环境时，如果样式没有隔离，就可能互相影响。`;

    const processor = unified().use(remarkParse);
    const tree = processor.parse(input);
    const converted = convertToOutline(tree as MarkdownNode);

    expect(converted).toBe(expected);
  });

  it('should handle heading hierarchy correctly (2.3 and 2.4 issue)', () => {
    const input = dedent`

    #### 2.2 导出逻辑 (Database -> Markdown)

    这是"条件持久化"的核心实现。导出不是简单的 dump，而是一个带逻辑的渲染过程。

    1. **第一步：获取引用集合**
    在导出页面前，先查询数据库，找出哪些 Block 是"被引用者"。
    \`\`\`sql
    -- 找出所有作为 target 被引用的 block_uuid
    SELECT DISTINCT target_uuid FROM refs;

    \`\`\`

    *将此结果加载到内存中的 \`Set<String> referencedBlockIds\`。*
    2. **第二步：渲染流**
    遍历 Block 生成 Markdown 时，检查当前 Block 的 ID 是否在 \`Set\` 中。
    * **IF 存在：** 追加 HTML 注释 ID。
    * **IF 不存在：** 仅输出内容，**不输出 ID**。


    *伪代码逻辑：*
    \`\`\`javascript
    function exportBlockToMarkdown(block, referencedBlockIds) {
        let line = "- " + block.content;

        // 只有当这个块被其他地方引用了，才把身份证号写在脸上
        if (referencedBlockIds.has(block.uuid)) {
            line += \` \`;
        }

        return line;
    }

    \`\`\`



    #### 2.3 导入逻辑 (Markdown -> Database)

    这是整个系统中最关键的"唯一一次"导入，或者是从外部编辑器修改后的重载。

    1. **正则提取：** 使用正则 \`/(.*) $/\` 解析每一行。
    2. **ID 决策策略：**
    * **情况 A：解析到了 ID** -> 直接使用该 ID 作为数据库的主键（\`uuid\`）。如果数据库里已有该 ID，则执行 UPDATE；如果没有，执行 INSERT。
    * **情况 B：没解析到 ID** -> 视为新数据。数据库自动生成一个新的 UUID。



    #### 2.4 潜在风险与对策

    * **风险：外部破坏引用。**
    如果用户在 VSCode 里把 \` \` 删掉了，或者把这行字删了重写，ID 就会丢失。下次导入时，数据库会把它当成新 Block（生成新 ID）。
    * **后果：** 之前指向这个 Block 的引用会失效（Dead Link）。
    * **对策：** 这是单向数据流的必然代价。如果不希望 ID 丢失，就必须像 Logseq 一样强制所有 Block 都有 ID。既然选择了"条件式 ID"带来的整洁，就默认接受"外部编辑器大改会导致引用断裂"的风险。



    ### 总结方案

    1. **历史记录：** 使用 **SQLite \`AFTER UPDATE\` 触发器** 自动维护 \`blocks_history\` 表。
    2. **ID 语法：** 使用 **行尾 HTML 注释** \` \` 以保持 Markdown 视觉纯净。
    3. **条件逻辑：** 仅当 Block UUID 存在于 \`refs\` 表的 \`target_uuid\` 列时，导出时才写入 HTML 注释；否则保持纯文本。`;

    const expected = dedent`
    - #### 2.2 导出逻辑 (Database -> Markdown)
      - 这是"条件持久化"的核心实现。导出不是简单的 dump，而是一个带逻辑的渲染过程。
      - **第一步：获取引用集合**
        - 在导出页面前，先查询数据库，找出哪些 Block 是"被引用者"。
        -
          \`\`\`sql
            -- 找出所有作为 target 被引用的 block_uuid
            SELECT DISTINCT target_uuid FROM refs;
            
          \`\`\`
      - *将此结果加载到内存中的 \`Set<String> referencedBlockIds\`。*
      - **第二步：渲染流**
        - 遍历 Block 生成 Markdown 时，检查当前 Block 的 ID 是否在 \`Set\` 中。
          - **IF 存在：** 追加 HTML 注释 ID。
          - **IF 不存在：** 仅输出内容，**不输出 ID**。
          - *伪代码逻辑：*
          -
            \`\`\`javascript
              function exportBlockToMarkdown(block, referencedBlockIds) {
                  let line = "- " + block.content;
              
                  // 只有当这个块被其他地方引用了，才把身份证号写在脸上
                  if (referencedBlockIds.has(block.uuid)) {
                      line += \` \`;
                  }
              
                  return line;
              }
              
            \`\`\`
    - #### 2.3 导入逻辑 (Markdown -> Database)
      - 这是整个系统中最关键的"唯一一次"导入，或者是从外部编辑器修改后的重载。
      - **正则提取：** 使用正则 \`/(.*) $/\` 解析每一行。
      - **ID 决策策略：**
        - **情况 A：解析到了 ID** -> 直接使用该 ID 作为数据库的主键（\`uuid\`）。如果数据库里已有该 ID，则执行 UPDATE；如果没有，执行 INSERT。
        - **情况 B：没解析到 ID** -> 视为新数据。数据库自动生成一个新的 UUID。
    - #### 2.4 潜在风险与对策
      - **风险：外部破坏引用。**
        - 如果用户在 VSCode 里把 \` \` 删掉了，或者把这行字删了重写，ID 就会丢失。下次导入时，数据库会把它当成新 Block（生成新 ID）。
      - **后果：** 之前指向这个 Block 的引用会失效（Dead Link）。
      - **对策：** 这是单向数据流的必然代价。如果不希望 ID 丢失，就必须像 Logseq 一样强制所有 Block 都有 ID。既然选择了"条件式 ID"带来的整洁，就默认接受"外部编辑器大改会导致引用断裂"的风险。
    - ### 总结方案
      - **历史记录：** 使用 **SQLite \`AFTER UPDATE\` 触发器** 自动维护 \`blocks_history\` 表。
      - **ID 语法：** 使用 **行尾 HTML 注释** \` \` 以保持 Markdown 视觉纯净。
      - **条件逻辑：** 仅当 Block UUID 存在于 \`refs\` 表的 \`target_uuid\` 列时，导出时才写入 HTML 注释；否则保持纯文本。`;

    const processor = unified().use(remarkParse);
    const tree = processor.parse(input);
    const converted = convertToOutline(tree as MarkdownNode);

    expect(converted).toBe(expected);
  });
});
