'use client';

import { useEffect, useState } from 'react';
import { useMarkdownToOutline } from '../hooks/useMarkdownToOutline';

export default function Home() {
  const [markdown, setMarkdown] = useState('');
  const [removeHeaderMarkers, setRemoveHeaderMarkers] = useState(false);
  const [convertToLogseqTodo, setConvertToLogseqTodo] = useState(true);
  const { outline, error } = useMarkdownToOutline(markdown, {
    removeHeaderMarkers,
    convertToLogseqTodo,
  });
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outline);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // 2秒后重置状态
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  useEffect(() => {
    console.log('Current markdown:', markdown);
    console.log('Current outline:', outline);
    if (error) {
      console.error('Error:', error);
    }
  }, [markdown, outline, error]);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-1 flex-col p-4">
        <h2 className="mb-2 text-xl font-bold">Markdown Input</h2>
        <textarea
          className="flex-1 resize-none rounded-md border p-2"
          value={markdown}
          onChange={e => setMarkdown(e.target.value)}
          placeholder="Enter your Markdown here..."
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold">Outline Output</h2>
          <div className="flex items-center gap-2">
            <label className="flex items-center mr-4">
              <input
                type="checkbox"
                checked={removeHeaderMarkers}
                onChange={e => setRemoveHeaderMarkers(e.target.checked)}
                className="mr-2"
              />
              Remove Header Markers
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={convertToLogseqTodo}
                onChange={e => setConvertToLogseqTodo(e.target.checked)}
                className="mr-2"
              />
              转换为Logseq TODO
            </label>
            <button
              onClick={handleCopy}
              className={`rounded px-3 py-1 ${
                copySuccess ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
              } transition-colors duration-200`}
            >
              {copySuccess ? '已复制!' : '复制'}
            </button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto whitespace-pre-wrap rounded-md border bg-white p-2">
          {error ? `Error: ${error}` : outline || 'No outline generated yet'}
        </pre>
      </div>
    </div>
  );
}
