# 技术栈

## 框架与运行时
- **Next.js 14.2.16**：使用 App Router 的 React 框架
- **React 18**：具有 hooks 和现代模式的 UI 库
- **TypeScript 5**：整个代码库的静态类型检查
- **Node.js**：运行时环境

## UI 与样式
- **Tailwind CSS 3.4.17**：实用优先的 CSS 框架
- **shadcn/ui**：基于 Radix UI 原语构建的组件库
- **Radix UI**：无头 UI 组件，注重可访问性
- **Lucide React**：图标库
- **next-themes**：深色/浅色主题支持

## 核心依赖
- **unified**：Markdown 处理管道
- **remark-parse**：Markdown 解析器
- **gray-matter**：YAML 前置元数据解析
- **unist-util-visit**：AST 遍历工具

## 开发工具
- **Prettier**：代码格式化，配合 Tailwind 插件
- **ESLint**：代码检查（构建时禁用以提升性能）
- **PostCSS**：CSS 处理

## 构建配置
- **独立输出**：针对部署优化
- **Webpack 构建工作器**：并行编译
- **图片优化**：为性能考虑已禁用
- **TypeScript 构建错误**：为加快构建速度已忽略

## 常用命令

### 开发
```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 运行 ESLint
```

### 包管理
```bash
pnpm install      # 安装依赖
pnpm add <pkg>    # 添加新依赖
```

## 性能优化
- 防抖转换（默认 300ms）
- 带过期时间的内容缓存
- 非紧急操作使用 requestIdleCallback
- 内存高效的 AST 处理
- 基于内容大小的自适应防抖