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

  // Join with double newlines to create proper paragraph separation in Markdown
  return results.join('\n\n');
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
  // Only convert to heading if content explicitly contains heading markers
  const hasHeadingMarkers = /^#{1,6}\s+/.test(content);
  return hasHeadingMarkers;
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
 * Utility function to clean up converted Markdown
 */
export function cleanupMarkdown(markdown: string): string {
  if (!markdown) return '';

  // Remove excessive blank lines (more than 2 consecutive)
  let cleaned = markdown.replace(/\n{3,}/g, '\n\n');

  // Ensure proper spacing around headings (headings should have blank lines before and after)
  cleaned = cleaned.replace(/^(#{1,6}\s+.+)$/gm, '\n$1\n');

  // Clean up list formatting
  cleaned = cleaned.replace(/^(\s*)-\s+$/gm, ''); // Remove empty list items

  // Ensure paragraphs are properly separated (but don't add extra spacing if already correct)
  cleaned = cleaned.replace(/([^\n])\n([^\n-#>])/g, '$1\n\n$2');

  // Trim whitespace from start and end, but preserve internal structure
  cleaned = cleaned.trim();

  return cleaned;
}