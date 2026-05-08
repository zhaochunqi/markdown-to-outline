import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import matter from 'gray-matter';
import { convertToOutline } from '../utils/convert-to-outline';
import type { MarkdownNode } from '../utils/convert-to-outline';

interface UseMarkdownToOutlineOptions {
  removeHeaderMarkers: boolean;
  debounceMs?: number;
  maxContentLength?: number;
}

interface UseMarkdownToOutlineResult {
  markdownContent: string;
  outlineContent: string;
  error: string | null;
  updateMarkdown: (content: string) => void;
  clearAll: () => void;
}

export function useMarkdownToOutline(
  options: UseMarkdownToOutlineOptions
): UseMarkdownToOutlineResult {
  const [markdownContent, setMarkdownContent] = useState('');
  const [outlineContent, setOutlineContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const conversionCacheRef = useRef<Map<string, { result: string; timestamp: number }>>(new Map());
  const lastContentHashRef = useRef<string>('');

  const debounceMs = options.debounceMs || 300;
  const maxContentLength = options.maxContentLength || 100000;
  const cacheExpiryMs = 5 * 60 * 1000;

  const markdownProcessor = useMemo(() => {
    return unified().use(remarkParse);
  }, []);

  const createContentHash = useCallback((content: string): string => {
    return `${content.length}:${content.substring(0, 100)}`;
  }, []);

  const getCachedResult = useCallback(
    (hash: string): string | null => {
      const cached = conversionCacheRef.current.get(hash);
      if (cached && Date.now() - cached.timestamp < cacheExpiryMs) {
        return cached.result;
      }
      if (cached) {
        conversionCacheRef.current.delete(hash);
      }
      return null;
    },
    [cacheExpiryMs]
  );

  const setCachedResult = useCallback((hash: string, result: string): void => {
    if (conversionCacheRef.current.size > 50) {
      const entries = Array.from(conversionCacheRef.current.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      for (let i = 0; i < 10; i++) {
        conversionCacheRef.current.delete(entries[i][0]);
      }
    }

    conversionCacheRef.current.set(hash, {
      result,
      timestamp: Date.now(),
    });
  }, []);

  const validateContentLength = useCallback(
    (content: string): void => {
      if (content.length > maxContentLength) {
        throw new Error(
          `Markdown内容过长（${content.length} 字符），请减少内容长度。建议保持在 ${Math.floor(maxContentLength / 1000)}KB 以内。`
        );
      }
    },
    [maxContentLength]
  );

  const convertMarkdownToOutline = useCallback(
    async (markdown: string): Promise<string> => {
      if (!markdown.trim()) {
        return '';
      }

      validateContentLength(markdown);

      const contentHash = createContentHash(markdown);
      const cachedResult = getCachedResult(contentHash);
      if (cachedResult !== null) {
        return cachedResult;
      }

      try {
        if (markdown.includes('```') && (markdown.match(/```/g) || []).length % 2 !== 0) {
          throw new Error('代码块未正确闭合，请检查 ``` 符号是否成对出现');
        }

        const { content } = matter(markdown);

        const ast = markdownProcessor.parse(content);

        const outlineResult = convertToOutline(ast as unknown as MarkdownNode, 0, {
          removeHeaderMarkers: options.removeHeaderMarkers,
          ignoreYamlFrontmatter: true,
          convertToLogseqTodo: true,
        });

        setCachedResult(contentHash, outlineResult);

        return outlineResult;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('Unexpected')) {
            throw new Error(`Markdown 解析错误：发现意外的语法结构。请检查格式是否正确。`);
          } else if (error.message.includes('parse')) {
            throw new Error(`Markdown 解析失败：${error.message}。请检查语法格式。`);
          } else {
            throw new Error(`转换到 Logseq 格式时出错：${error.message}`);
          }
        } else {
          throw new Error(`转换过程中发生未知错误，请尝试重新输入内容。`);
        }
      }
    },
    [
      options.removeHeaderMarkers,
      markdownProcessor,
      validateContentLength,
      createContentHash,
      getCachedResult,
      setCachedResult,
    ]
  );

  const debouncedConvert = useCallback(
    (content: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      const newHash = createContentHash(content);
      if (lastContentHashRef.current === newHash) {
        return;
      }

      lastContentHashRef.current = newHash;

      const adaptiveDebounceMs = content.length > 10000 ? debounceMs * 2 : debounceMs;

      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          setError(null);
          const result = await convertMarkdownToOutline(content);
          setOutlineContent(result);
        } catch (error) {
          console.error('Conversion error:', error);
          setError(error instanceof Error ? error.message : String(error));
        }
      }, adaptiveDebounceMs);
    },
    [debounceMs, createContentHash, convertMarkdownToOutline]
  );

  const updateMarkdown = useCallback(
    (content: string) => {
      setMarkdownContent(content);

      if (!content.trim()) {
        setOutlineContent('');
        setError(null);
        return;
      }

      debouncedConvert(content);
    },
    [debouncedConvert]
  );

  const clearAll = useCallback(() => {
    setMarkdownContent('');
    setOutlineContent('');
    setError(null);
    lastContentHashRef.current = '';

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    conversionCacheRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    markdownContent,
    outlineContent,
    error,
    updateMarkdown,
    clearAll,
  };
}
