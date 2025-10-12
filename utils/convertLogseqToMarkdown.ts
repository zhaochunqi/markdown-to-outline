/**
 * Logseq to Markdown Converter
 * Converts Logseq outline format back to standard Markdown
 */

import { parseLogseqOutline, type LogseqNode, type ParseLogseqOptions } from './parseLogseqOutline';

export interface ConvertToMarkdownOptions {
  preserveIndentation?: boolean;
  convertTodoItems?: boolean;
  useTaskListFormat?: boolean; // Convert TODO/DONE to [ ]/[x] format
}

/**
 * Converts Logseq outline format to Markdown
 */
export function convertLogseqToMarkdown(
  logseqContent: string,
  options: ConvertToMarkdownOptions = {
    preserveIndentation: true,
    convertTodoItems: true,
    useTaskListFormat: true,
  }
): string {
  if (!logseqContent || typeof logseqContent !== 'string') {
    return '';
  }

  // Parse the Logseq content into structured nodes
  const parseOptions: ParseLogseqOptions = {
    preserveIndentation: options.preserveIndentation,
    convertTodoItems: options.convertTodoItems,
  };

  const nodes = parseLogseqOutline(logseqContent, parseOptions);
  
  if (nodes.length === 0) {
    return '';
  }

  // Convert nodes to Markdown
  return convertNodesToMarkdown(nodes, options);
}

/**
 * Converts parsed Logseq nodes to Markdown format
 */
function convertNodesToMarkdown(
  nodes: LogseqNode[],
  options: ConvertToMarkdownOptions
): string {
  const results: string[] = [];
  
  for (const node of nodes) {
    const markdown = convertNodeToMarkdown(node, options);
    if (markdown) {
      results.push(markdown);
    }
  }
  
  // Join with single newlines for cleaner output
  return results.join('\n');
}

/**
 * Converts a single Logseq node to Markdown
 */
function convertNodeToMarkdown(
  node: LogseqNode,
  options: ConvertToMarkdownOptions,
  parentLevel: number = 0
): string {
  const results: string[] = [];
  
  // Process the current node
  const nodeMarkdown = processNodeContent(node, options, parentLevel);
  if (nodeMarkdown) {
    results.push(nodeMarkdown);
  }
  
  // Process children - they should be indented relative to parent
  if (node.children && node.children.length > 0) {
    const childrenMarkdown = node.children
      .map(child => convertNodeToMarkdown(child, options, node.level))
      .filter(Boolean);
    
    if (childrenMarkdown.length > 0) {
      // For children of headings, add them as content under the heading
      if (nodeMarkdown && (nodeMarkdown.startsWith('#') || node.type === 'heading')) {
        results.push(...childrenMarkdown);
      } else {
        // For children of regular items, maintain list structure
        results.push(...childrenMarkdown);
      }
    }
  }
  
  // Use single newline for better formatting, especially for headings
  return results.join('\n');
}

/**
 * Processes the content of a single node
 */
function processNodeContent(
  node: LogseqNode,
  options: ConvertToMarkdownOptions,
  parentLevel: number
): string {
  const { type, content, level } = node;
  
  switch (type) {
    case 'heading':
      return convertHeadingNode(content, level, parentLevel);
    
    case 'todo':
      if (options.convertTodoItems && options.useTaskListFormat) {
        return `- [ ] ${content}`;
      } else if (options.convertTodoItems) {
        return `**TODO:** ${content}`;
      }
      return content;
    
    case 'done':
      if (options.convertTodoItems && options.useTaskListFormat) {
        return `- [x] ${content}`;
      } else if (options.convertTodoItems) {
        return `**DONE:** ${content}`;
      }
      return content;
    
    case 'bullet':
    default:
      return convertBulletNode(content, level, parentLevel);
  }
}

/**
 * Converts a heading node to Markdown heading
 */
function convertHeadingNode(content: string, level: number, parentLevel: number): string {
  // Check if content already has heading markers
  const headingMatch = content.match(/^(#{1,6})\s+(.*)$/);
  
  if (headingMatch) {
    // Content already has heading markers, use them
    return content;
  }
  
  // Convert indentation level to heading level
  // Level 0 = H1, Level 1 = H2, etc.
  const headingLevel = Math.min(level + 1, 6); // Max heading level is 6
  const headingMarker = '#'.repeat(headingLevel);
  
  return `${headingMarker} ${content}`;
}

/**
 * Converts a bullet point to appropriate Markdown format
 */
function convertBulletNode(content: string, level: number, parentLevel: number): string {
  // First check if content contains heading markers - if so, treat as heading
  const headingMatch = content.match(/^(#{1,6})\s+(.*)$/);
  if (headingMatch) {
    return content; // Return as-is since it's already a proper heading
  }
  
  // Check if this should be converted to a heading based on context
  if (shouldConvertToHeading(content, level)) {
    return convertHeadingNode(content, level, parentLevel);
  }
  
  // Handle special formats within content
  const processedContent = processSpecialFormats(content);
  
  // For nested content, determine if it should be a list item or paragraph
  if (level === 0) {
    // Top-level items that aren't headings become paragraphs
    return processedContent;
  } else {
    // Nested items become list items with proper indentation
    const indent = '  '.repeat(level - 1);
    return `${indent}- ${processedContent}`;
  }
}

/**
 * Determines if a bullet point should be converted to a heading
 */
function shouldConvertToHeading(content: string, level: number): boolean {
  // Convert to heading if:
  // 1. Content explicitly contains heading markers
  // 2. Content is at top levels (0-2) and looks like a title
  
  const hasHeadingMarkers = /^#{1,6}\s+/.test(content);
  if (hasHeadingMarkers) {
    return true;
  }
  
  // Only convert to heading for top-level items that look like titles
  if (level > 2) {
    return false;
  }
  
  // Heuristic: short content without ending punctuation might be a heading
  const isShort = content.length < 80;
  const noEndingPunctuation = !/[.!?。！？]$/.test(content.trim());
  const hasCapitalStart = /^[A-Z\u4e00-\u9fff]/.test(content.trim());
  const notSentence = !content.includes('，') && !content.includes(',') && content.split(' ').length < 8;
  
  return level <= 1 && isShort && noEndingPunctuation && hasCapitalStart && notSentence;
}

/**
 * Processes special formats within content (code blocks, quotes, etc.)
 */
function processSpecialFormats(content: string): string {
  let processed = content;
  
  // Handle code blocks
  processed = processCodeBlocks(processed);
  
  // Handle blockquotes
  processed = processBlockquotes(processed);
  
  // Handle inline code
  processed = processInlineCode(processed);
  
  return processed;
}

/**
 * Processes code blocks in content
 */
function processCodeBlocks(content: string): string {
  // Handle multi-line code blocks that might be represented in Logseq format
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;
  
  return content.replace(codeBlockRegex, (match, lang, code) => {
    // Clean up the code content and ensure proper formatting
    const cleanCode = code.replace(/^\s{2,}/gm, ''); // Remove excessive indentation
    return `\`\`\`${lang || ''}\n${cleanCode}\n\`\`\``;
  });
}

/**
 * Processes blockquotes in content
 */
function processBlockquotes(content: string): string {
  // Handle blockquotes that might be represented with > markers
  const lines = content.split('\n');
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('> ')) {
      return trimmed; // Already properly formatted
    } else if (trimmed.startsWith('>')) {
      return `> ${trimmed.substring(1).trim()}`; // Add space after >
    }
    return line;
  });
  
  return processedLines.join('\n');
}

/**
 * Processes inline code in content
 */
function processInlineCode(content: string): string {
  // Ensure inline code is properly formatted
  return content.replace(/`([^`]+)`/g, '`$1`');
}

/**
 * Validates the conversion result
 */
export function validateMarkdownOutput(markdown: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!markdown || typeof markdown !== 'string') {
    errors.push('Output must be a non-empty string');
    return { isValid: false, errors, warnings };
  }
  
  const lines = markdown.split('\n');
  
  // Check for common Markdown formatting issues
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    // Check for malformed headings
    const headingMatch = line.match(/^(#{1,6})\s*(.*)/);
    if (headingMatch && !headingMatch[2]) {
      warnings.push(`Line ${lineNumber}: Empty heading detected`);
    }
    
    // Check for malformed code blocks
    if (line.includes('```') && !line.match(/^```\w*$/)) {
      const codeBlockMatch = line.match(/```(\w*)(.*)/);
      if (codeBlockMatch && codeBlockMatch[2].trim()) {
        warnings.push(`Line ${lineNumber}: Code block should be on separate line`);
      }
    }
    
    // Check for malformed task lists
    const taskMatch = line.match(/^(\s*)-\s*\[([ x])\]\s*(.*)/);
    if (taskMatch && !taskMatch[3]) {
      warnings.push(`Line ${lineNumber}: Empty task item detected`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Utility function to clean up converted Markdown
 */
export function cleanupMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  // Remove excessive blank lines (more than 2 consecutive)
  let cleaned = markdown.replace(/\n{3,}/g, '\n\n');
  
  // Ensure proper spacing around headings
  cleaned = cleaned.replace(/^(#{1,6}\s+.+)$/gm, '\n$1\n');
  
  // Clean up list formatting
  cleaned = cleaned.replace(/^(\s*)-\s+$/gm, ''); // Remove empty list items
  
  // Trim whitespace from start and end
  cleaned = cleaned.trim();
  
  return cleaned;
}