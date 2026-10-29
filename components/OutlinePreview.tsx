'use client';

import { Button } from '@/components/ui/button';
import { Check, ChevronDown, Copy } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';

interface OutlinePreviewProps {
  content: string;
  className?: string;
}

interface OutlineItem {
  id: string;
  depth: number;
  text: string;
  code?: {
    language: string;
    value: string;
  };
  children: OutlineItem[];
}

function parseOutline(content: string): OutlineItem[] {
  const lines = content.split('\n');
  const flatItems: OutlineItem[] = [];

  // A Logseq block can span several lines: only `- ` starts a new block, every other
  // line is an indented continuation of the block above (tables rely on this).
  const appendContinuation = (line: string): void => {
    const text = line.trim();
    if (!text) return;
    const current = flatItems[flatItems.length - 1];
    if (!current) return;

    if (current.code) {
      current.code.value = `${current.code.value}\n${text}`;
    } else {
      current.text = `${current.text}\n${text}`;
    }
  };

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const bulletMatch = line.match(/^(\s*)[-*]\s+(.*)$/);

    if (!bulletMatch) {
      appendContinuation(line);
      continue;
    }

    const leadingSpaces = bulletMatch[1].length;
    const depth = Math.max(0, Math.floor(leadingSpaces / 2));
    const text = bulletMatch[2].trim();

    if (!text) continue;

    if (text.startsWith('```')) {
      const language = text.slice(3).trim();
      const codeLines: string[] = [];
      const startIndex = index;

      while (index + 1 < lines.length) {
        index += 1;
        const nextLine = lines[index];
        const trimmedLine = nextLine.trim();

        if (trimmedLine === '```') {
          break;
        }

        codeLines.push(nextLine.replace(/^\s{0,4}/, ''));
      }

      flatItems.push({
        id: `${startIndex}-${depth}-code-${language}`,
        depth,
        text,
        code: {
          language,
          value: codeLines.join('\n'),
        },
        children: [],
      });
      continue;
    }

    flatItems.push({
      id: `${index}-${depth}-${text}`,
      depth,
      text,
      children: [],
    });
  }

  const roots: OutlineItem[] = [];
  const stack: OutlineItem[] = [];

  for (const item of flatItems) {
    while (stack.length > 0 && stack[stack.length - 1].depth >= item.depth) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];
    if (parent) {
      parent.children.push(item);
    } else {
      roots.push(item);
    }

    stack.push(item);
  }

  return roots;
}

function countOutlineItems(items: OutlineItem[]): number {
  return items.reduce((total, item) => total + 1 + countOutlineItems(item.children), 0);
}

function OutlineText({ item }: { item: OutlineItem }) {
  if (item.code) {
    return (
      <span className="block min-w-0">
        <span className="mb-2 inline-flex rounded bg-stone-100 px-1.5 py-0.5 text-[11px] font-medium text-stone-500">
          {item.code.language || 'code'}
        </span>
        <pre className="overflow-auto rounded-md border border-stone-200 bg-stone-50 p-3 font-mono text-xs leading-relaxed text-stone-700">
          <code>{item.code.value}</code>
        </pre>
      </span>
    );
  }

  const { text } = item;
  const taskMatch = text.match(/^(TODO|DONE)\s+([\s\S]+)/);
  const headingMatch = text.match(/^(#{1,6})\s+([\s\S]+)/);

  if (taskMatch) {
    const [, marker, body] = taskMatch;
    const isDone = marker === 'DONE';

    return (
      <span className="inline-flex flex-wrap items-baseline gap-2">
        <span
          className={`rounded px-1.5 py-0.5 text-[11px] font-semibold tracking-wide ${
            isDone ? 'bg-stone-100 text-stone-500' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {marker}
        </span>
        <span className="whitespace-pre-wrap break-words">{body}</span>
      </span>
    );
  }

  if (headingMatch) {
    const [, marker, body] = headingMatch;

    return (
      <span className="inline-flex flex-wrap items-baseline gap-2 font-medium text-stone-950">
        <span className="font-mono text-xs text-stone-400">{marker}</span>
        <span className="whitespace-pre-wrap break-words">{body}</span>
      </span>
    );
  }

  // Multi-line blocks (tables, mostly) read much better unwrapped and scrollable
  if (text.includes('\n')) {
    return <span className="block whitespace-pre overflow-x-auto">{text}</span>;
  }

  return <span className="whitespace-pre-wrap break-words">{text}</span>;
}

function OutlineNode({ item }: { item: OutlineItem }) {
  const hasChildren = item.children.length > 0;

  return (
    <div className="outline-node-group">
      <div className="group flex min-h-8 items-start rounded-md px-1.5 py-1.5 text-sm text-stone-800 hover:bg-stone-50">
        <span className="mt-1 flex h-4 w-4 flex-none items-center justify-center">
          {hasChildren ? (
            <ChevronDown className="h-3.5 w-3.5 text-stone-400 group-hover:text-stone-700" />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-stone-400 group-hover:bg-stone-700" />
          )}
        </span>
        <span className="ml-2 min-w-0 break-words leading-6">
          <OutlineText item={item} />
        </span>
      </div>

      {hasChildren && (
        <div className="ml-3 border-l border-stone-200 pl-5">
          {item.children.map(child => (
            <OutlineNode key={child.id} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}

const OutlinePreviewComponent = ({ content, className = '' }: OutlinePreviewProps) => {
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');
  const items = useMemo(() => parseOutline(content), [content]);
  const itemCount = useMemo(() => countOutlineItems(items), [items]);
  const hasContent = content.trim().length > 0;

  const handleCopy = useCallback(async () => {
    if (!hasContent) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopyState('success');
      setTimeout(() => setCopyState('idle'), 2500);
    } catch (error) {
      console.error('复制失败:', error);
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2500);
    }
  }, [content, hasContent]);

  return (
    <section className={`flex h-full flex-col ${className}`}>
      <div className="flex items-center justify-between gap-4 border-b border-stone-200 bg-white px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-stone-900" />
            <h2 className="text-base font-semibold text-stone-950">Outline 预览</h2>
          </div>
          <p className="mt-1 text-xs text-stone-500">{itemCount} 个节点</p>
        </div>

        <Button
          type="button"
          onClick={handleCopy}
          disabled={!hasContent}
          className={`h-12 rounded-lg px-5 text-base shadow-sm transition-all ${
            copyState === 'success'
              ? 'bg-emerald-700 text-white hover:bg-emerald-700'
              : copyState === 'error'
                ? 'bg-red-700 text-white hover:bg-red-700'
                : 'bg-stone-950 text-white hover:bg-stone-800'
          }`}
        >
          {copyState === 'success' ? (
            <>
              <Check className="h-5 w-5" />
              已复制
            </>
          ) : copyState === 'error' ? (
            '复制失败'
          ) : (
            <>
              <Copy className="h-5 w-5" />
              复制大纲
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-5">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-stone-200 bg-stone-50 text-center">
            <div>
              <p className="text-sm font-medium text-stone-700">转换结果会显示在这里</p>
              <p className="mt-1 text-sm text-stone-500">左侧输入 Markdown 后自动生成树形大纲。</p>
            </div>
          </div>
        ) : (
          <div className="font-mono">
            {items.map(item => (
              <OutlineNode key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export const OutlinePreview = memo(OutlinePreviewComponent);
