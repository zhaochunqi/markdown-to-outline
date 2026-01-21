import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { convertToOutline } from '../convertToOutline';

describe('Regression Tests', () => {
    it('should handle blockquote bug fix (Sputnik moment example)', () => {
        const input = `简言之：  
> **"斯普特尼克时刻" = 危机感 + 觉醒 + 全面改革的起点**。`;

        const expected = '- 简言之：\n- > **"斯普特尼克时刻" = 危机感 + 觉醒 + 全面改革的起点**。';

        const processor = unified().use(remarkParse);
        const tree = processor.parse(input);
        const converted = convertToOutline(tree);

        expect(converted).toBe(expected);
    });

    it('should handle list parsing regression (ordered/unordered list pairs)', () => {
        const input = `### 典型应用场景

1. **SQLite in the Browser (WASM)**：
* 这是目前 OPFS 最著名的用例。通过 OPFS 的同步句柄，SQLite 编译成的 WebAssembly 可以在浏览器中像在原生环境中一样高效地读写数据库文件，而无需把整个数据库加载到内存中。


2. **高性能编辑器/IDE**：
* 如 Photoshop Web 版、VS Code Web 版，利用 OPFS 暂存大量临时文件或工作区快照。


3. **视频/音频处理**：
* 处理大型媒体文件时，需要频繁的随机读写（seek and write），OPFS 是唯一能满足 Web端这一需求的方案。`;

        const expected = `- ### 典型应用场景
  - **SQLite in the Browser (WASM)**：
    - 这是目前 OPFS 最著名的用例。通过 OPFS 的同步句柄，SQLite 编译成的 WebAssembly 可以在浏览器中像在原生环境中一样高效地读写数据库文件，而无需把整个数据库加载到内存中。
  - **高性能编辑器/IDE**：
    - 如 Photoshop Web 版、VS Code Web 版，利用 OPFS 暂存大量临时文件或工作区快照。
  - **视频/音频处理**：
    - 处理大型媒体文件时，需要频繁的随机读写（seek and write），OPFS 是唯一能满足 Web端这一需求的方案。`;

        // Note: The original test expected 2 spaces indentation for children of list items.
        // Let's verify if `convertToOutline` uses 2 spaces. 
        // Logic in convertToOutline: `getIndent(depth)` uses '  '.repeat(depth).
        // If "SQLite..." is level 1 (depth 0?), it has "- ".
        // Its child "这是..." is level 2 (depth 1), so "  - ".
        // The expected string above seems to match standard markdown outline format.

        const processor = unified().use(remarkParse);
        const tree = processor.parse(input);
        const converted = convertToOutline(tree);

        expect(converted).toBe(expected);
    });
});
