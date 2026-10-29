import { describe, it, expect } from 'vitest';
import dedent from 'dedent';
import { convertMarkdownToOutline, parseMarkdown } from '../../markdown-converter';

describe('MarkdownConverter - GFM tables', () => {
  it('should parse a table into a table node instead of a paragraph', () => {
    const markdown = dedent`
      | # | 检查 | 为什么 |
      | --- | --- | --- |
      | 1 | 锁 | 防抢 index.lock |`;

    expect(parseMarkdown(markdown).children?.map(child => child.type)).toEqual(['table']);
  });

  it('should render the whole table as a single block with indented continuation lines', () => {
    const markdown = dedent`
      | # | 检查 | 为什么 |
      | --- | --- | --- |
      | 1 | \`mkdir .git/sync.lock\` | 防两轮重叠 |
      | 2 | \`MERGE_HEAD\` | 卡在中间态就停手 |`;

    expect(convertMarkdownToOutline(markdown)).toBe(
      dedent`
        - | # | 检查 | 为什么 |
          | --- | --- | --- |
          | 1 | \`mkdir .git/sync.lock\` | 防两轮重叠 |
          | 2 | \`MERGE_HEAD\` | 卡在中间态就停手 |`
    );
  });

  it('should keep inline formatting inside cells', () => {
    const markdown = dedent`
      | 名称 | 说明 |
      | --- | --- |
      | \`code\` | **加粗** |`;

    expect(convertMarkdownToOutline(markdown)).toBe(
      dedent`
        - | 名称 | 说明 |
          | --- | --- |
          | \`code\` | **加粗** |`
    );
  });

  it('should preserve column alignment in the separator row', () => {
    const markdown = dedent`
      | 左 | 中 | 右 |
      | :--- | :---: | ---: |
      | a | b | c |`;

    expect(convertMarkdownToOutline(markdown)).toBe(
      dedent`
        - | 左 | 中 | 右 |
          | :--- | :---: | ---: |
          | a | b | c |`
    );
  });

  it('should escape pipes that appear inside a cell', () => {
    // Plain strings on purpose: dedent re-processes backslash escapes
    const markdown = '| 表达式 | 说明 |\n| --- | --- |\n| a \\| b | 或运算 |';

    expect(convertMarkdownToOutline(markdown)).toBe(
      '- | 表达式 | 说明 |\n  | --- | --- |\n  | a \\| b | 或运算 |'
    );
  });

  it('should pad rows that have fewer cells than the header', () => {
    const markdown = dedent`
      | a | b | c |
      | --- | --- | --- |
      | 1 | 2 |`;

    expect(convertMarkdownToOutline(markdown)).toBe(
      dedent`
        - | a | b | c |
          | --- | --- | --- |
          | 1 | 2 |  |`
    );
  });

  it('should keep <br> inside a cell as a line break instead of splitting the row', () => {
    const markdown = dedent`
      | a | b |
      | --- | --- |
      | 一<br>二 | x |`;

    expect(convertMarkdownToOutline(markdown)).toBe(
      dedent`
        - | a | b |
          | --- | --- |
          | 一<br>二 | x |`
    );
  });

  it('should indent a table under the preceding heading', () => {
    const markdown = dedent`
      ## 巡检项

      | # | 检查 |
      | --- | --- |
      | 1 | 锁 |`;

    expect(convertMarkdownToOutline(markdown)).toBe(
      dedent`
        - ## 巡检项
          - | # | 检查 |
            | --- | --- |
            | 1 | 锁 |`
    );
  });

  it('should nest a table inside a list item', () => {
    const markdown = dedent`
      - 第一步

        | a | b |
        | --- | --- |
        | 1 | 2 |`;

    expect(convertMarkdownToOutline(markdown)).toBe(
      dedent`
        - 第一步
          - | a | b |
            | --- | --- |
            | 1 | 2 |`
    );
  });

  it('should keep tables separate from surrounding paragraphs', () => {
    const markdown = dedent`
      前一段。

      | a | b |
      | --- | --- |
      | 1 | 2 |

      后一段。`;

    expect(convertMarkdownToOutline(markdown)).toBe(
      dedent`
        - 前一段。
        - | a | b |
          | --- | --- |
          | 1 | 2 |
        - 后一段。`
    );
  });
});
