import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { convertToOutline } from '@/utils/convertToOutline';
import { convertLogseqToMarkdown, cleanupMarkdown } from '@/utils/convertLogseqToMarkdown';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import matter from 'gray-matter';
import type { MarkdownNode } from '@/utils/convertToOutline';

export interface BidirectionalConverterOptions {
  removeHeaderMarkers: boolean;
  debounceMs?: number;
  maxContentLength?: number; // Limit content length for performance
  enableCaching?: boolean; // Enable conversion result caching
}

export interface BidirectionalConverterResult {
  markdownContent: string;
  logseqContent: string;
  error: string | null;
  updateMarkdown: (content: string) => void;
  updateLogseq: (content: string) => void;
  clearAll: () => void;
}

/**
 * Custom hook for managing bidirectional conversion between Markdown and Logseq formats
 * Provides debounced conversion to avoid frequent processing with performance optimizations
 */
export function useBidirectionalConverter(
  options: BidirectionalConverterOptions
): BidirectionalConverterResult {
  const [markdownContent, setMarkdownContent] = useState('');
  const [logseqContent, setLogseqContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Refs to track conversion source and prevent infinite loops
  const lastUpdateSource = useRef<'markdown' | 'logseq' | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const conversionCacheRef = useRef<Map<string, { result: string; timestamp: number }>>(new Map());
  const lastContentHashRef = useRef<{ markdown: string; logseq: string }>({ markdown: '', logseq: '' });
  
  const debounceMs = options.debounceMs || 300;
  const maxContentLength = options.maxContentLength || 100000; // 100KB limit
  const enableCaching = options.enableCaching !== false; // Default to true
  const cacheExpiryMs = 5 * 60 * 1000; // 5 minutes cache expiry

  // Memoized unified processor for better performance
  const markdownProcessor = useMemo(() => {
    return unified().use(remarkParse);
  }, []);

  /**
   * Creates a simple hash for caching purposes
   */
  const createContentHash = useCallback((content: string, type: 'markdown' | 'logseq'): string => {
    return `${type}:${content.length}:${content.substring(0, 100)}`;
  }, []);

  /**
   * Gets cached conversion result if available and not expired
   */
  const getCachedResult = useCallback((hash: string): string | null => {
    if (!enableCaching) return null;
    
    const cached = conversionCacheRef.current.get(hash);
    if (cached && Date.now() - cached.timestamp < cacheExpiryMs) {
      return cached.result;
    }
    
    // Remove expired cache entry
    if (cached) {
      conversionCacheRef.current.delete(hash);
    }
    
    return null;
  }, [enableCaching, cacheExpiryMs]);

  /**
   * Caches conversion result
   */
  const setCachedResult = useCallback((hash: string, result: string): void => {
    if (!enableCaching) return;
    
    // Limit cache size to prevent memory issues
    if (conversionCacheRef.current.size > 50) {
      // Remove oldest entries
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
  }, [enableCaching]);

  /**
   * Validates content length for performance
   */
  const validateContentLength = useCallback((content: string, type: string): void => {
    if (content.length > maxContentLength) {
      throw new Error(`${type}内容过长（${content.length} 字符），请减少内容长度以提高性能。建议保持在 ${Math.floor(maxContentLength / 1000)}KB 以内。`);
    }
  }, [maxContentLength]);

  /**
   * Converts Markdown content to Logseq format with performance optimizations
   */
  const convertMarkdownToLogseq = useCallback(async (markdown: string): Promise<string> => {
    if (!markdown.trim()) {
      return '';
    }

    // Performance: Check content length
    validateContentLength(markdown, 'Markdown');

    // Performance: Check cache first
    const contentHash = createContentHash(markdown, 'markdown');
    const cachedResult = getCachedResult(contentHash);
    if (cachedResult !== null) {
      return cachedResult;
    }

    try {
      // Performance: Early validation without heavy parsing
      if (markdown.includes('```') && (markdown.match(/```/g) || []).length % 2 !== 0) {
        throw new Error('代码块未正确闭合，请检查 ``` 符号是否成对出现');
      }

      // Performance: Use memoized processor
      const { content } = matter(markdown);

      // Performance: Quick format check
      if (content.includes('#') && !content.match(/^#+\s/m)) {
        throw new Error('标题格式不正确，请在 # 符号后添加空格');
      }

      // Performance: Use memoized processor instead of creating new one
      const ast = markdownProcessor.parse(content);

      // Convert AST to outline with TODO conversion enabled by default
      const outlineContent = convertToOutline(ast as unknown as MarkdownNode, 0, {
        removeHeaderMarkers: options.removeHeaderMarkers,
        ignoreYamlFrontmatter: true,
        convertToLogseqTodo: true, // Always enabled as per requirements
      });

      // Performance: Cache the result
      setCachedResult(contentHash, outlineContent);

      return outlineContent;
    } catch (error) {
      if (error instanceof Error) {
        // Provide more specific error messages
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
  }, [options.removeHeaderMarkers, markdownProcessor, validateContentLength, createContentHash, getCachedResult, setCachedResult]);

  /**
   * Converts Logseq content to Markdown format with performance optimizations
   */
  const convertLogseqToMarkdownFormat = useCallback((logseq: string): string => {
    if (!logseq.trim()) {
      return '';
    }

    // Performance: Check content length
    validateContentLength(logseq, 'Logseq');

    // Performance: Check cache first
    const contentHash = createContentHash(logseq, 'logseq');
    const cachedResult = getCachedResult(contentHash);
    if (cachedResult !== null) {
      return cachedResult;
    }

    try {
      // Performance: Optimize line processing
      const lines = logseq.split('\n');
      const nonEmptyLines = lines.filter(line => line.trim());
      
      // Performance: Early validation with minimal processing
      if (nonEmptyLines.length === 0) {
        return '';
      }

      // Performance: Batch indentation check
      const indentedLines = nonEmptyLines.filter(line => line.match(/^\s+/));
      if (indentedLines.length > 0) {
        // Use more efficient validation
        const hasInconsistentIndent = indentedLines.some(line => {
          const indent = line.match(/^\s*/)?.[0] || '';
          return indent.length % 2 !== 0; // Assuming 2-space indentation
        });
        
        if (hasInconsistentIndent) {
          throw new Error('缩进不一致，请使用统一的缩进格式（建议每级 2 个空格）');
        }
      }

      // Performance: Quick bullet point validation
      const hasBulletPoints = nonEmptyLines.some(line => line.trim().match(/^[-*+]/));
      if (!hasBulletPoints && nonEmptyLines.length > 0) {
        throw new Error('未找到有效的项目符号，请使用 - 或 * 开始每个项目');
      }

      const result = convertLogseqToMarkdown(logseq, {
        preserveIndentation: true,
        convertTodoItems: true,
        useTaskListFormat: true,
      });
      
      // Apply cleanup to ensure proper Markdown formatting
      const cleanedResult = cleanupMarkdown(result);
      
      // Performance: Cache the result
      setCachedResult(contentHash, cleanedResult);
      
      return cleanedResult;
    } catch (error) {
      if (error instanceof Error) {
        // Provide more specific error messages
        if (error.message.includes('indent') || error.message.includes('缩进')) {
          throw new Error(`Logseq 格式错误：${error.message}`);
        } else if (error.message.includes('bullet') || error.message.includes('项目符号')) {
          throw new Error(`Logseq 格式错误：${error.message}`);
        } else if (error.message.includes('parse')) {
          throw new Error(`Logseq 解析失败：${error.message}。请检查格式是否正确。`);
        } else {
          throw new Error(`转换到 Markdown 格式时出错：${error.message}`);
        }
      } else {
        throw new Error(`转换过程中发生未知错误，请检查 Logseq 格式是否正确。`);
      }
    }
  }, [validateContentLength, createContentHash, getCachedResult, setCachedResult]);

  /**
   * Debounced function to perform conversion with performance optimizations
   */
  const debouncedConvert = useCallback((
    content: string,
    source: 'markdown' | 'logseq',
    converter: (content: string) => Promise<string> | string
  ) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Performance: Check if content actually changed to avoid unnecessary conversions
    const currentHash = source === 'markdown' ? 
      lastContentHashRef.current.markdown : 
      lastContentHashRef.current.logseq;
    
    const newHash = createContentHash(content, source);
    if (currentHash === newHash) {
      return; // Content hasn't meaningfully changed
    }

    // Update content hash
    if (source === 'markdown') {
      lastContentHashRef.current.markdown = newHash;
    } else {
      lastContentHashRef.current.logseq = newHash;
    }

    // Performance: Use shorter debounce for small content, longer for large content
    const adaptiveDebounceMs = content.length > 10000 ? debounceMs * 2 : debounceMs;

    // Set new timeout for debounced conversion
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        setError(null);
        lastUpdateSource.current = source;

        // Performance: Use requestIdleCallback for non-urgent conversions if available
        const performConversion = async () => {
          const result = await converter(content);
          
          if (source === 'markdown') {
            setLogseqContent(result);
          } else {
            setMarkdownContent(result);
          }
        };

        // Use requestIdleCallback for better performance if available
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            performConversion().catch(error => {
              console.error('Conversion error:', error);
              setError(error instanceof Error ? error.message : String(error));
            });
          }, { timeout: 1000 });
        } else {
          await performConversion();
        }
      } catch (error) {
        console.error('Conversion error:', error);
        setError(error instanceof Error ? error.message : String(error));
      }
    }, adaptiveDebounceMs);
  }, [debounceMs, createContentHash]);

  /**
   * Updates Markdown content and converts to Logseq
   */
  const updateMarkdown = useCallback((content: string) => {
    setMarkdownContent(content);
    
    // If content is empty, clear both sides
    if (!content.trim()) {
      setLogseqContent('');
      setError(null);
      return;
    }

    // Only convert if the last update wasn't from Logseq (prevent infinite loop)
    if (lastUpdateSource.current !== 'logseq') {
      debouncedConvert(content, 'markdown', convertMarkdownToLogseq);
    }
  }, [debouncedConvert, convertMarkdownToLogseq]);

  /**
   * Updates Logseq content and converts to Markdown
   */
  const updateLogseq = useCallback((content: string) => {
    setLogseqContent(content);
    
    // If content is empty, clear both sides
    if (!content.trim()) {
      setMarkdownContent('');
      setError(null);
      return;
    }

    // Only convert if the last update wasn't from Markdown (prevent infinite loop)
    if (lastUpdateSource.current !== 'markdown') {
      debouncedConvert(content, 'logseq', convertLogseqToMarkdownFormat);
    }
  }, [debouncedConvert, convertLogseqToMarkdownFormat]);

  /**
   * Clears all content and errors with cache cleanup
   */
  const clearAll = useCallback(() => {
    setMarkdownContent('');
    setLogseqContent('');
    setError(null);
    lastUpdateSource.current = null;
    
    // Clear any pending debounced operations
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    // Performance: Clear content hashes
    lastContentHashRef.current = { markdown: '', logseq: '' };
    
    // Performance: Clear cache to free memory
    if (enableCaching) {
      conversionCacheRef.current.clear();
    }
  }, [enableCaching]);

  // Reset the update source after a delay to allow for new conversions
  useEffect(() => {
    const resetTimeout = setTimeout(() => {
      lastUpdateSource.current = null;
    }, debounceMs * 2);

    return () => clearTimeout(resetTimeout);
  }, [markdownContent, logseqContent, debounceMs]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    markdownContent,
    logseqContent,
    error,
    updateMarkdown,
    updateLogseq,
    clearAll,
  };
}