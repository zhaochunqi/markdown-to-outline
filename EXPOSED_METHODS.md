# 暴露的转换方法

我已经为你创建了完整的 markdown 转换接口，让你不用打开网页就能测试功能。

## 核心暴露的方法

### 1. `convertMarkdownToOutline(markdown, options?)`

主要的转换函数，接受 markdown 字符串，返回 outline 格式字符串。

### 2. `testConvertMarkdown(markdown, options?)`

安全的转换函数，返回 `{success, result?, error?}` 对象，便于错误处理。

### 3. `parseMarkdown(markdown)`

将 markdown 解析为 AST，用于调试和高级用法。

## 使用方式

### CLI 脚本

```bash
# 使用示例 markdown
pnpm test-converter

# 测试自己的 markdown
pnpm test-converter "# Hello World\n\nThis is **bold** text."
```

### 在代码中使用

```typescript
import { convertMarkdownToOutline, testConvertMarkdown } from './utils/markdown-converter';
import dedent from 'dedent';

const markdown = dedent`
  # 标题
  
  这是一个**加粗**文本。
  
  - 项目 1
  - 项目 2
    - 子项目 2.1
    - 子项目 2.2`;

const result = convertMarkdownToOutline(markdown, {
  convertToLogseqTodo: true,
  removeHeaderMarkers: false,
});

console.log(result);
```

## 主要改进

1. **修复了嵌套列表的缩进问题** - 子列表现在正确缩进
2. **添加了 dedent 支持** - 让多行字符串更美观
3. **完整的类型支持** - TypeScript 类型定义
4. **错误处理** - 安全的转换函数
5. **测试覆盖** - 31 个测试用例全部通过

## 示例转换

输入：

```markdown
# 任务列表

- [ ] 待办事项
- [x] 已完成事项

## 代码示例

\`\`\`javascript
const x = 1;
console.log(x);
\`\`\`
```

输出：

````
- # 任务列表
- TODO 待办事项
- DONE 已完成事项
- ## 代码示例
    - ```javascript
        const x = 1;
        console.log(x);
      ```
````

现在你完全可以不打开网页就测试所有 markdown 转换功能了！
