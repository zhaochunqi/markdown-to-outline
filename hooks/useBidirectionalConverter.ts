import { useState, useEffect, useCallback, useRef } from 'react';
import { convertToOutline } from '@/utils/convertToOutline';
import { convertLogseqToMarkdown } from '@/utils/convertLogseqToMarkdown';
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
      // Parse front matter and get content
      const { content } = matter(markdown);

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
      throw new Error(
        `Error converting Markdown to Logseq: ${error instanceof Error ? error.message : String(error)}`
      );
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
      return convertLogseqToMarkdown(logseq, {
        preserveIndentation: true,
        convertTodoItems: true,
        useTaskListFormat: true,
      });
    } catch (error) {
      throw new Error(
        `Error converting Logseq to Markdown: ${error instanceof Error ? error.message : String(error)}`
      );
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