import { useState, useEffect, useCallback, useRef } from 'react';
import { convertToOutline } from '@/utils/convertToOutline';
import { convertLogseqToMarkdown, cleanupMarkdown } from '@/utils/convertLogseqToMarkdown';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import matter from 'gray-matter';
import type { MarkdownNode } from '@/utils/convertToOutline';

export interface BidirectionalConverterOptions {
  removeHeaderMarkers: boolean;
  debounceMs?: number;
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
 * Provides debounced conversion to avoid frequent processing
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
  
  const debounceMs = options.debounceMs || 300;

  /**
   * Converts Markdown content to Logseq format
   */
  const convertMarkdownToLogseq = useCallback(async (markdown: string): Promise<string> => {
    if (!markdown.trim()) {
      return '';
    }

    try {
      // Validate basic Markdown structure
      if (markdown.includes('```') && (markdown.match(/```/g) || []).length % 2 !== 0) {
        throw new Error('代码块未正确闭合，请检查 ``` 符号是否成对出现');
      }

      // Parse front matter and get content
      const { content } = matter(markdown);

      // Check for common Markdown issues
      if (content.includes('#') && !content.match(/^#+\s/m)) {
        throw new Error('标题格式不正确，请在 # 符号后添加空格');
      }

      // Parse markdown to AST
      const ast = await unified().use(remarkParse).parse(content);

      // Convert AST to outline with TODO conversion enabled by default
      const outlineContent = convertToOutline(ast as unknown as MarkdownNode, 0, {
        removeHeaderMarkers: options.removeHeaderMarkers,
        ignoreYamlFrontmatter: true,
        convertToLogseqTodo: true, // Always enabled as per requirements
      });

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
  }, [options.removeHeaderMarkers]);

  /**
   * Converts Logseq content to Markdown format
   */
  const convertLogseqToMarkdownFormat = useCallback((logseq: string): string => {
    if (!logseq.trim()) {
      return '';
    }

    try {
      // Validate basic Logseq structure
      const lines = logseq.split('\n').filter(line => line.trim());
      
      // Check for consistent indentation
      const indentedLines = lines.filter(line => line.match(/^\s+/));
      if (indentedLines.length > 0) {
        const inconsistentIndent = indentedLines.some(line => {
          const indent = line.match(/^\s*/)?.[0] || '';
          return indent.length % 2 !== 0; // Assuming 2-space indentation
        });
        
        if (inconsistentIndent) {
          throw new Error('缩进不一致，请使用统一的缩进格式（建议每级 2 个空格）');
        }
      }

      // Check for valid bullet points
      const bulletLines = lines.filter(line => line.trim().match(/^[-*+]/));
      if (bulletLines.length === 0 && lines.length > 0) {
        throw new Error('未找到有效的项目符号，请使用 - 或 * 开始每个项目');
      }

      const result = convertLogseqToMarkdown(logseq, {
        preserveIndentation: true,
        convertTodoItems: true,
        useTaskListFormat: true,
      });
      
      // Apply cleanup to ensure proper Markdown formatting
      return cleanupMarkdown(result);
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
  }, []);

  /**
   * Debounced function to perform conversion
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

    // Set new timeout for debounced conversion
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        setError(null);
        lastUpdateSource.current = source;

        const result = await converter(content);
        
        if (source === 'markdown') {
          setLogseqContent(result);
        } else {
          setMarkdownContent(result);
        }
      } catch (error) {
        console.error('Conversion error:', error);
        setError(error instanceof Error ? error.message : String(error));
      }
    }, debounceMs);
  }, [debounceMs]);

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
   * Clears all content and errors
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
  }, []);

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