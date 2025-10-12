'use client';

import { useState } from 'react';
import { useBidirectionalConverter } from '@/hooks/useBidirectionalConverter';
import { PanelEditor } from '@/components/PanelEditor';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function Home() {
  const [removeHeaderMarkers, setRemoveHeaderMarkers] = useState(false);
  
  const {
    markdownContent,
    logseqContent,
    error,
    updateMarkdown,
    updateLogseq,
    clearAll,
  } = useBidirectionalConverter({
    removeHeaderMarkers,
    debounceMs: 300,
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Settings Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remove-headers"
              checked={removeHeaderMarkers}
              onCheckedChange={(checked) => setRemoveHeaderMarkers(checked as boolean)}
            />
            <Label htmlFor="remove-headers" className="text-sm font-medium">
              移除标题标记
            </Label>
          </div>
          
          <button
            onClick={clearAll}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            清空全部
          </button>
        </div>
      </div>

      {/* Main Content - Left and Right Panels */}
      <div className="flex flex-1 pt-16">
        {/* Left Panel - Markdown */}
        <div className="flex-1 p-6 border-r border-gray-200">
          <PanelEditor
            title="Markdown"
            content={markdownContent}
            placeholder="在此输入 Markdown 内容..."
            onChange={updateMarkdown}
            error={error}
          />
        </div>

        {/* Right Panel - Logseq Outline */}
        <div className="flex-1 p-6">
          <PanelEditor
            title="Logseq 大纲"
            content={logseqContent}
            placeholder="在此输入 Logseq 大纲格式内容..."
            onChange={updateLogseq}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
