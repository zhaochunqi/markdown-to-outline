# 技术栈

## 框架与运行时

- **Next.js 16.4.3**：使用 App Router 的 React 框架，默认 Turbopack 构建
- **React 19**：具有 hooks 和现代模式的 UI 库
- **TypeScript 6**：整个代码库的静态类型检查
- **Node.js 20.20.2**：运行时环境

## UI 与样式

- **Tailwind CSS 4.3.3**：实用优先的 CSS 框架，主题定义在 CSS 的 `@theme` 里
- **@tailwindcss/postcss**：v4 的 PostCSS 插件
- **shadcn/ui**：基于 Radix UI 原语构建的组件库
- **Radix UI**：无头 UI 组件，注重可访问性
- **Lucide React**：图标库

## 核心依赖

- **unified**：Markdown 处理管道
- **remark-parse**：Markdown 解析器
- **remark-gfm**：GFM 扩展（表格、删除线、任务列表、自动链接）
- **gray-matter**：YAML 前置元数据解析

## 开发工具

- **Prettier**：代码格式化，配合 Tailwind 插件
- **ESLint 9**：代码检查，flat config（`eslint.config.mjs`），`next lint` 在 Next.js 16 已移除
- **PostCSS**：CSS 处理

## 构建配置

- **Turbopack**：Next.js 16 默认打包器，不再使用自定义 Webpack 配置
- **独立输出**：针对部署优化
- **图片优化**：为性能考虑已禁用

## 常用命令

### 开发

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm start            # 启动生产服务器
npm run lint         # 运行 ESLint
```

### 包管理

```bash
npm install          # 安装依赖
npm install <pkg>    # 添加新依赖
```

## 性能优化

- 防抖转换（默认 300ms）
- 带过期时间的内容缓存
- 非紧急操作使用 requestIdleCallback
- 内存高效的 AST 处理
- 基于内容大小的自适应防抖
