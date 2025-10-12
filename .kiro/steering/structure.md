# 项目结构

## 目录组织

### 核心应用
- **`app/`**：Next.js App Router 页面和布局
  - `page.tsx`：带双向编辑器的主应用页面
  - `layout.tsx`：带主题提供者的根布局
  - `globals.css`：全局样式和 CSS 变量

### 组件
- **`components/`**：可复用的 React 组件
  - `PanelEditor.tsx`：带复制功能的主编辑器组件
  - `theme-provider.tsx`：主题上下文提供者
  - **`ui/`**：shadcn/ui 组件库（40+ 个组件）

### 业务逻辑
- **`utils/`**：核心转换工具
  - `convertToOutline.ts`：Markdown 到 Logseq 转换
  - `convertLogseqToMarkdown.ts`：Logseq 到 Markdown 转换
  - `parseLogseqOutline.ts`：Logseq 格式解析器
  - `demo-*.ts`：示例文件和集成测试
  - **`__tests__/`**：测试文件目录

### 自定义 Hooks
- **`hooks/`**：React 自定义 hooks
  - `useBidirectionalConverter.ts`：带缓存的主转换逻辑
  - `useMarkdownToOutline.ts`：Markdown 处理 hook
  - `use-toast.ts`：Toast 通知工具
  - `use-mobile.tsx`：移动设备检测 hook

### 配置
- **`lib/`**：共享工具
  - `utils.ts`：通用工具函数（cn 等）

## 文件命名约定

### 组件
- 组件文件使用 PascalCase：`PanelEditor.tsx`
- UI 组件使用 kebab-case：`alert-dialog.tsx`
- React 组件包含 `.tsx` 扩展名

### 工具
- 工具文件使用 camelCase：`convertToOutline.ts`
- 使用表明功能的描述性名称
- 将相关工具分组在同一目录

### Hooks
- 以 `use` 为前缀：`useBidirectionalConverter.ts`
- 前缀后使用 camelCase
- 在同一文件中包含返回类型接口

## 导入模式

### 路径别名
- `@/` 映射到项目根目录
- 使用 `@/components/ui/` 导入 shadcn 组件
- 使用 `@/hooks/` 导入自定义 hooks
- 使用 `@/utils/` 导入工具函数
- 使用 `@/lib/` 导入共享库

### 导入组织
1. 外部库（React、Next.js 等）
2. 内部工具和 hooks
3. 组件导入
4. 类型导入（使用 `type` 关键字）

## 代码组织原则

### 性能优先
- 记忆化昂贵的操作
- 为转换结果使用缓存
- 为用户输入实现防抖
- 针对大文档处理进行优化

### 类型安全
- 为所有数据结构定义接口
- 使用严格的 TypeScript 配置
- 与实现一起导出类型
- 尽可能使用类型导入

### 组件结构
- 保持组件专注和单一用途
- 为复杂状态逻辑使用自定义 hooks
- 实现适当的错误边界
- 遵循 React 性能最佳实践