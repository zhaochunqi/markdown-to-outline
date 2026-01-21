'use client';

import { useMarkdownToOutline } from '@/hooks/useMarkdownToOutline';
import { PanelEditor } from '@/components/PanelEditor';
import { ServiceWorkerProvider } from '@/components/ServiceWorkerProvider';
import { Suspense } from 'react';
import { PageSkeleton } from '@/components/LoadingState';

function HomeContent() {
  const { markdownContent, outlineContent, error, updateMarkdown, clearAll } = useMarkdownToOutline(
    {
      removeHeaderMarkers: false,
      debounceMs: 300,
      maxContentLength: 100000,
    }
  );

  return (
    <>
      <ServiceWorkerProvider />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Markdown → Logseq 大纲</h1>
                  <p className="text-sm text-gray-500">将 Markdown 转换为 Logseq outline 格式</p>
                </div>
              </div>

              <button
                type="button"
                onClick={clearAll}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
              >
                <svg
                  className="mr-2 inline h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>清空</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                清空全部
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl p-6">
          <div className="grid h-[calc(100vh-140px)] grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Panel - Markdown Input */}
            <div className="overflow-hidden rounded-xl border border-gray-200/50 bg-white shadow-sm">
              <PanelEditor
                title="Markdown 输入"
                content={markdownContent}
                placeholder={`# 欢迎使用 Markdown 编辑器

在这里输入你的 Markdown 内容，它会自动转换为 Logseq 大纲格式。

## 支持的功能
- [x] 标题层级
- [x] 列表项目
- [x] TODO 项目
- [x] 代码块
- [x] 引用块

试试输入一些内容吧！`}
                onChange={updateMarkdown}
                error={error}
                className="h-full"
                validationHints={[
                  '使用 # ## ### 创建不同级别的标题',
                  '在 # 符号后添加空格',
                  '使用 - [ ] 创建待办事项',
                  '使用 - [x] 创建已完成事项',
                  '代码块需要用 ``` 包围',
                  '列表项使用 - 或 * 开头',
                ]}
              />
            </div>

            {/* Right Panel - Logseq Outline Output */}
            <div className="overflow-hidden rounded-xl border border-gray-200/50 bg-white shadow-sm">
              <PanelEditor
                title="Logseq 大纲输出"
                content={outlineContent}
                placeholder={`- 转换结果将显示在这里
  - 自动转换为 Logseq outline 格式
  - 支持层级结构和 TODO 项目
- 特点
  - 实时转换
  - 保持原始格式结构
  - 自动处理 TODO/DONE 项目

复制右侧结果即可在 Logseq 中使用！`}
                onChange={() => {}}
                className="h-full"
                validationHints={[
                  '结果自动生成，无需手动编辑',
                  '可以直接复制到 Logseq 使用',
                  '层级结构使用 2 空格缩进',
                  'TODO 和 DONE 会自动转换',
                ]}
              />
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <title>功能</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Markdown → Logseq 单向转换</span>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
