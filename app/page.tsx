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
