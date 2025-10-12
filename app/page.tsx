'use client';

import { useBidirectionalConverter } from '@/hooks/useBidirectionalConverter';
import { PanelEditor } from '@/components/PanelEditor';

export default function Home() {
  const {
    markdownContent,
    logseqContent,
    error,
    updateMarkdown,
    updateLogseq,
    clearAll,
  } = useBidirectionalConverter({
    removeHeaderMarkers: false, // Always keep header markers
    debounceMs: 300, // Responsive debouncing
    maxContentLength: 100000, // 100KB limit for performance
    enableCaching: true, // Enable result caching
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Markdown ⇄ Logseq 转换器</h1>
                <p className="text-sm text-gray-500">实时双向转换，支持 TODO 项目和层级结构</p>
              </div>
            </div>
            
            <button
              onClick={clearAll}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              清空全部
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          {/* Left Panel - Markdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
            <PanelEditor
              title="Markdown"
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
                '列表项使用 - 或 * 开头'
              ]}
            />
          </div>

          {/* Right Panel - Logseq Outline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
            <PanelEditor
              title="Logseq 大纲"
              content={logseqContent}
              placeholder={`- 欢迎使用 Logseq 大纲编辑器
  - 在这里输入 Logseq 格式的内容
  - 它会自动转换为标准 Markdown 格式
- 支持的功能
  - TODO 项目转换
    - TODO 待办事项
    - DONE 已完成事项
  - 层级结构保持
  - 代码块和引用
- 试试输入一些内容吧！`}
              onChange={updateLogseq}
              error={error}
              className="h-full"
              validationHints={[
                '使用 - 或 * 开始每个项目',
                '使用 2 个空格进行缩进',
                '保持缩进的一致性',
                'TODO 和 DONE 项目会自动转换',
                '子项目需要正确缩进在父项目下',
                '避免混合使用不同的项目符号'
              ]}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>实时转换 • 保持格式 • 双向同步</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
