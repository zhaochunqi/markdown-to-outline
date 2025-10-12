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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <Button
          onClick={handleCopy}
          disabled={!content.trim()}
          size="sm"
          variant={copySuccess ? "default" : "outline"}
          className={`transition-all duration-200 ${
            copySuccess 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'hover:bg-gray-50'
          }`}
        >
          {copySuccess ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              已复制!
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
      <div className="flex-1 flex flex-col">
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 resize-none font-mono text-sm leading-relaxed ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
        />
        
        {/* Error display */}
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              <span className="font-medium">错误:</span> {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}