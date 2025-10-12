'use client';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState, useCallback, useMemo, memo } from 'react';

interface PanelEditorProps {
  title: string;
  content: string;
  placeholder: string;
  onChange: (content: string) => void;
  error?: string | null;
  className?: string;
  validationHints?: string[];
}

const PanelEditorComponent = ({
  title,
  content,
  placeholder,
  onChange,
  error,
  className = '',
  validationHints = [],
}: PanelEditorProps) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyError, setCopyError] = useState(false);

  // Performance: Memoize copy handler to avoid recreation on every render
  const handleCopy = useCallback(async () => {
    if (!content.trim()) return;
    
    try {
      // Performance: Avoid unnecessary string processing for copy
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setCopyError(false);
      
      // Show success feedback for 3 seconds (longer for better UX)
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('复制失败:', err);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  }, [content]);

  // Performance: Memoize character count and status
  const contentStats = useMemo(() => {
    const length = content.length;
    const hasContent = content.trim().length > 0;
    const isLarge = length > 50000; // Flag large content for UI feedback
    
    return {
      length,
      hasContent,
      isLarge,
      displayText: isLarge ? `${Math.floor(length / 1000)}K 字符` : `${length} 字符`
    };
  }, [content]);

  // Performance: Memoize textarea change handler
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

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
          <div className={`text-xs px-2 py-1 rounded-full transition-colors duration-200 ${
            contentStats.hasContent 
              ? contentStats.isLarge 
                ? 'text-orange-600 bg-orange-100' 
                : 'text-gray-600 bg-gray-200'
              : 'text-gray-400 bg-gray-100'
          }`}>
            {contentStats.displayText}
            {contentStats.hasContent && (
              <span className={`ml-1 ${contentStats.isLarge ? 'text-orange-700' : 'text-green-600'}`}>
                • {contentStats.isLarge ? '大文档' : '可复制'}
              </span>
            )}
          </div>
        </div>
        
        <Button
          onClick={handleCopy}
          disabled={!contentStats.hasContent}
          size="sm"
          variant="ghost"
          className={`transition-all duration-300 ${
            copySuccess 
              ? 'bg-green-100 text-green-700 hover:bg-green-200 shadow-sm scale-105' 
              : copyError
              ? 'bg-red-100 text-red-700 hover:bg-red-200 shadow-sm'
              : 'hover:bg-gray-100 text-gray-600 hover:shadow-sm'
          } ${!contentStats.hasContent ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={!contentStats.hasContent ? '没有内容可复制' : copySuccess ? '复制成功！' : copyError ? '复制失败，请重试' : '复制到剪贴板'}
        >
          {copySuccess ? (
            <>
              <Check className="w-4 h-4 mr-1 animate-pulse" />
              <span className="font-medium">已复制</span>
            </>
          ) : copyError ? (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="font-medium">失败</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              <span>复制</span>
            </>
          )}
        </Button>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col p-4">
        <Textarea
          value={content}
          onChange={handleTextareaChange}
          placeholder={placeholder}
          className={`flex-1 resize-none font-mono text-sm leading-relaxed border-0 focus:ring-0 focus:outline-none bg-transparent placeholder:text-gray-400 transition-colors duration-200 ${
            error ? 'text-red-600' : contentStats.isLarge ? 'text-gray-700' : 'text-gray-800'
          }`}
          spellCheck={false} // Performance: Disable spellcheck for large content
        />
        
        {/* Performance warning for large content */}
        {contentStats.isLarge && !error && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800 mb-1">⚡ 大文档性能提示</p>
                <p className="text-sm text-amber-700">
                  当前文档较大，转换可能需要更多时间。系统已自动优化处理速度。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 mb-1">转换失败</p>
                <p className="text-sm text-red-700 leading-relaxed">{error}</p>
                
                {/* Error suggestions based on common issues */}
                <div className="mt-3 p-3 bg-red-25 border border-red-100 rounded-md">
                  <p className="text-xs font-medium text-red-800 mb-2">💡 常见解决方案：</p>
                  <ul className="text-xs text-red-700 space-y-1">
                    {error.includes('parse') || error.includes('解析') ? (
                      <>
                        <li>• 检查 Markdown 语法是否正确</li>
                        <li>• 确保标题使用正确的 # 符号</li>
                        <li>• 检查列表项是否有正确的缩进</li>
                      </>
                    ) : error.includes('Logseq') ? (
                      <>
                        <li>• 检查 Logseq 格式的缩进是否一致</li>
                        <li>• 确保使用 - 或 * 作为项目符号</li>
                        <li>• TODO/DONE 项目需要正确的格式</li>
                      </>
                    ) : error.includes('过长') || error.includes('长度') ? (
                      <>
                        <li>• 尝试分割大文档为较小的部分</li>
                        <li>• 移除不必要的内容或格式</li>
                        <li>• 考虑使用更简洁的格式</li>
                      </>
                    ) : (
                      <>
                        <li>• 尝试清空内容重新输入</li>
                        <li>• 检查是否有特殊字符或格式</li>
                        <li>• 确保内容符合相应的格式规范</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation hints - show when no error and content is empty */}
        {!error && !content.trim() && validationHints.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800 mb-2">💡 格式提示</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  {validationHints.map((hint, index) => (
                    <li key={index}>• {hint}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Performance: Memoize the component to prevent unnecessary re-renders
export const PanelEditor = memo(PanelEditorComponent);