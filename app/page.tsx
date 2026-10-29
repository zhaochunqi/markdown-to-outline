'use client';

import { useMarkdownToOutline } from '@/hooks/useMarkdownToOutline';
import { OutlinePreview } from '@/components/OutlinePreview';
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
      <div className="min-h-screen bg-stone-100 text-stone-950">
        <header className="border-b border-stone-200 bg-stone-50/90 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-5 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Markdown → Logseq 大纲</h1>
                <p className="mt-1 text-sm text-stone-600">左侧编辑，右侧预览并复制。</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/zhaochunqi/markdown-to-outline"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  源码
                </a>
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-5">
          <div className="grid min-h-[calc(100vh-132px)] grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
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
- [x] 表格

试试输入一些内容吧！`}
                onChange={updateMarkdown}
                error={error}
                className="h-full"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
              <OutlinePreview content={outlineContent} className="h-full" />
            </div>
          </div>
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
