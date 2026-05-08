'use client';

import { Textarea } from '@/components/ui/textarea';
import { useCallback, useMemo, memo } from 'react';
import type { ChangeEvent } from 'react';

interface PanelEditorProps {
  title: string;
  content: string;
  placeholder: string;
  onChange: (content: string) => void;
  error?: string | null;
  className?: string;
}

const PanelEditorComponent = ({
  title,
  content,
  placeholder,
  onChange,
  error,
  className = '',
}: PanelEditorProps) => {
  const contentStats = useMemo(() => {
    const length = content.length;
    const isLarge = length > 50000;

    return {
      isLarge,
      displayText: isLarge ? `${Math.floor(length / 1000)}K 字符` : `${length} 字符`,
    };
  }, [content]);

  const handleTextareaChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className={`flex h-full flex-col ${className}`}>
      <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-stone-900" />
          <h2 className="text-base font-semibold text-stone-950">{title}</h2>
        </div>
        <div
          className={`rounded-full px-2.5 py-1 text-xs ${
            contentStats.isLarge ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'
          }`}
        >
          {contentStats.displayText}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Textarea
          value={content}
          onChange={handleTextareaChange}
          placeholder={placeholder}
          className={`flex-1 resize-none border-0 bg-transparent font-mono text-sm leading-relaxed text-stone-800 shadow-none transition-colors placeholder:text-stone-400 focus-visible:ring-0 focus-visible:ring-offset-0 ${
            error ? 'text-red-600' : ''
          }`}
          spellCheck={false}
        />

        {contentStats.isLarge && !error && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            当前文档较大，转换可能需要更多时间。
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="mb-1 text-sm font-semibold text-red-800">转换失败</p>
            <p className="text-sm leading-relaxed text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const PanelEditor = memo(PanelEditorComponent);
