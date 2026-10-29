import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { convertToOutline, MarkdownNode } from './convert-to-outline';

export interface ConvertMarkdownOptions {
  removeHeaderMarkers?: boolean;
  ignoreYamlFrontmatter?: boolean;
  convertToLogseqTodo?: boolean;
}

/**
 * Convert markdown string to outline format
 * This is the main entry point for processing markdown text
 */
export function convertMarkdownToOutline(
  markdown: string,
  options: ConvertMarkdownOptions = {}
): string {
  if (typeof markdown !== 'string') {
    throw new Error('Markdown input must be a string');
  }

  // Default options
  const defaultOptions = {
    removeHeaderMarkers: false,
    ignoreYamlFrontmatter: true,
    convertToLogseqTodo: false,
    ...options,
  };

  try {
    // Parse markdown to AST (GFM for tables, strikethrough, task lists, autolinks)
    const processor = unified().use(remarkParse).use(remarkGfm);
    const ast = processor.parse(markdown) as MarkdownNode;

    // Convert AST to outline format
    return convertToOutline(ast, 0, defaultOptions);
  } catch (error) {
    throw new Error(
      `Failed to process markdown: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Parse markdown string to AST (for testing)
 */
export function parseMarkdown(markdown: string): MarkdownNode {
  if (typeof markdown !== 'string') {
    throw new Error('Markdown input must be a string');
  }

  const processor = unified().use(remarkParse).use(remarkGfm);
  return processor.parse(markdown) as MarkdownNode;
}

/**
 * Test helper: Convert markdown to outline with detailed error info
 */
export function testConvertMarkdown(
  markdown: string,
  options?: ConvertMarkdownOptions
): {
  success: boolean;
  result?: string;
  error?: string;
} {
  try {
    const result = convertMarkdownToOutline(markdown, options);
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Re-export the core function and types for advanced usage
export { convertToOutline };
export type { MarkdownNode };
