'use client';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface PanelEditorProps {
  title: string;
  content: string;
  placeholder: string;
  onChange: (content: string) => void;
  error?: string | null;
  className?: string;
}

export function PanelEditor({
  title,
  content,
  placeholder,
  onChange,
  error,
  className = '',
}: PanelEditorProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    if (!content.trim()) return;
    
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with title and copy button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            title === 'Markdown' 
              ? 'bg-blue-500' 
              : 'bg-indigo-500'
          }`}></div>
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {content.length} 字符
          </div>
        </div>
        
        <Button
          onClick={handleCopy}
          disabled={!content.trim()}
          size="sm"
          variant="ghost"
          className={`transition-all duration-200 ${
            copySuccess 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          {copySuccess ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              复制
            </>
          )}
        </Button>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col p-4">
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 resize-none font-mono text-sm leading-relaxed border-0 focus:ring-0 focus:outline-none bg-transparent placeholder:text-gray-400 ${
            error ? 'text-red-600' : 'text-gray-800'
          }`}
        />
        
        {/* Error display */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">转换错误</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}