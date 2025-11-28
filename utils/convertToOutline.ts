import type { Node } from 'unist';

export interface MarkdownNode extends Node {
  children?: MarkdownNode[];
  depth?: number;
  value?: string;
  lang?: string | null;
  url?: string | null;
  type: string;
}

interface ConvertOptions {
  removeHeaderMarkers: boolean;
  ignoreYamlFrontmatter?: boolean;
  convertToLogseqTodo?: boolean;
}

// Performance: Cache indent strings to avoid repeated string creation
const indentCache = new Map<number, string>();
const getIndent = (d: number): string => {
  const depth = Math.max(0, d);
  if (!indentCache.has(depth)) {
    indentCache.set(depth, '  '.repeat(depth));
  }
  return indentCache.get(depth)!;
};

export function convertToOutline(
  node: MarkdownNode,
  depth = 0,
  options: ConvertOptions = {
    removeHeaderMarkers: false,
    ignoreYamlFrontmatter: true,
    convertToLogseqTodo: false,
  }
): string {
  if (!node || typeof node !== 'object') {
    throw new Error(`Invalid node: ${JSON.stringify(node)}`);
  }

  // Performance: Optimize text content processing with early returns and caching
  const processTextContent = (node: any): string => {
    switch (node.type) {
      case 'text':
        if (!node.value) return '';
        // Performance: Only check TODO format if conversion is enabled
        if (options.convertToLogseqTodo) {
          const todoMatch = node.value.match(/^[\[\s?]\]\s+(.+)$/);
          if (todoMatch) {
            return `TODO ${todoMatch[1]}`;
          }
        }
        return node.value;

      case 'link':
        return node.children?.[0]?.value ? `[${node.children[0].value}](${node.url})` : '';

      case 'emphasis':
        if (!node.children) return '';
        return `*${node.children.map(processTextContent).join('')}*`;

      case 'strong':
        if (!node.children) return '';
        return `**${node.children.map(processTextContent).join('')}**`;

      case 'inlineCode':
        return node.value || '';

      case 'code':
        return `${node.lang || ''}${node.value || ''}`;

      default:
        return '';
    }
  };

  switch (node.type) {
    case 'yaml':
      if (options.ignoreYamlFrontmatter) {
        return '';
      }
      return `${getIndent(depth)}- ${(node as any).value}`;

    case 'root':
      if (!('children' in node)) {
        throw new Error(`Invalid root node: ${JSON.stringify(node)}`);
      }

      return processChildrenWithHierarchy(node.children as MarkdownNode[], depth, options);

    case 'heading':
      if (!('depth' in node) || !('children' in node)) {
        throw new Error(`Invalid heading node: ${JSON.stringify(node)}`);
      }

      const headingLevel = node.depth as number;
      const headerMarker = options.removeHeaderMarkers ? '' : '#'.repeat(headingLevel) + ' ';
      const headingContent = (node.children as any[])
        .map(processTextContent)
        .filter(Boolean)
        .join('');

      return `${getIndent(depth)}- ${headerMarker}${headingContent}`;

    case 'paragraph':
      if (!('children' in node)) {
        throw new Error(`Invalid paragraph node: ${JSON.stringify(node)}`);
      }
      const paragraphContent = (node.children as any[])
        .map(processTextContent)
        .filter(Boolean)
        .join('');
      const trimmedContent = paragraphContent.trim();
      if (!trimmedContent) return '';
      return `${getIndent(depth)}- ${trimmedContent}`;

    case 'list':
      if (!('children' in node)) {
        throw new Error(`Invalid list node: ${JSON.stringify(node)}`);
      }
      return (node.children as MarkdownNode[])
        .map(item => convertToOutline(item, depth, options))
        .filter(Boolean)
        .join('\n');

    case 'listItem':
      if (!('children' in node)) {
        throw new Error(`Invalid listItem node: ${JSON.stringify(node)}`);
      }
      const itemContent = (node.children as MarkdownNode[])
        .map(child => {
          if (child.type === 'paragraph') {
            const content = (child.children as any[])
              .map(processTextContent)
              .filter(Boolean)
              .join('');
            return content.trim();
          }
          return convertToOutline(child, depth + 1, options);
        })
        .filter(Boolean)
        .join('\n');

      if (options.convertToLogseqTodo) {
        const todoUncheckedRegex = /^\s*\[ \]\s*(.*)/;
        const matchUnchecked = itemContent.match(todoUncheckedRegex);
        if (matchUnchecked) {
          return `${getIndent(depth)}- TODO ${matchUnchecked[1]}`;
        }

        const todoCheckedRegex = /^\s*\[x\]\s*(.*)/i;
        const matchChecked = itemContent.match(todoCheckedRegex);
        if (matchChecked) {
          return `${getIndent(depth)}- DONE ${matchChecked[1]}`;
        }
      }
      return `${getIndent(depth)}- ${itemContent}`;

    case 'code':
      if (!('value' in node)) {
        throw new Error(`Invalid code node: ${JSON.stringify(node)}`);
      }
      // Performance: Optimize code block processing
      const codeValue = (node as any).value || '';
      const codeLang = (node as any).lang || '';

      if (!codeValue) {
        return `${getIndent(depth)}- \`\`\`${codeLang}\n${getIndent(depth + 1)}\`\`\``;
      }

      // Performance: Use more efficient string building for large code blocks
      const lines = codeValue.split('\n');
      const baseIndent = getIndent(depth + 2);
      const indentedLines = lines.map((line: string) => `${baseIndent}${line}`);
      const codeContent = `\`\`\`${codeLang}\n${indentedLines.join('\n')}\n${getIndent(depth + 1)}\`\`\``;
      return `${getIndent(depth)}- ${codeContent}`;

    case 'blockquote':
      if (!('children' in node)) {
        throw new Error(`Invalid blockquote node: ${JSON.stringify(node)}`);
      }
      const quoteContent = (node.children as MarkdownNode[])
        .map(child => {
          if (child.type === 'paragraph') {
            // 将所有内容连接起来，并移除 <br> 标签
            return (child.children as any[])
              .map(c => c.value || '')
              .join('')
              .replace(/<br>/g, '');
          }
          return '';
        })
        .filter(Boolean);

      if (quoteContent.length === 0) return '';

      const firstLine = `${getIndent(depth)}- > ${quoteContent[0]}`;
      const restLines = quoteContent.slice(1).map(line => `${getIndent(depth + 1)}> ${line}`);

      return [firstLine, ...restLines].join('\n');

    default:
      return '';
  }
}

/**
 * Processes children nodes while maintaining proper hierarchy with performance optimizations
 */
function processChildrenWithHierarchy(
  children: MarkdownNode[],
  baseDepth: number,
  options: ConvertOptions
): string {
  if (!children || children.length === 0) return '';

  const results: string[] = [];
  let lastHeadingDepth = baseDepth;

  // Performance: Pre-allocate array with estimated size
  results.length = 0;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    // Performance: Skip empty or invalid nodes early
    if (!child || !child.type) continue;

    if (child.type === 'heading') {
      // For headings, calculate depth based on heading level
      const headingLevel = (child as any).depth;
      lastHeadingDepth = baseDepth + headingLevel - 1;

      const headingResult = convertToOutline(child, lastHeadingDepth, options);
      if (headingResult) results.push(headingResult);
    } else if (child.type === 'paragraph') {
      // Look ahead to see if this paragraph is followed by a list
      const nextChild = i + 1 < children.length ? children[i + 1] : null;
      const isFollowedByList = nextChild?.type === 'list';

      if (isFollowedByList) {
        // This paragraph should be a parent of the following list
        // Paragraphs that follow headings should be indented under them
        const paragraphDepth = lastHeadingDepth > baseDepth ? lastHeadingDepth + 1 : baseDepth;
        const paragraphResult = convertToOutline(child, paragraphDepth, options);
        if (paragraphResult) results.push(paragraphResult);

        // Process the following list as children of this paragraph
        i++; // Skip the next iteration since we're processing the list here
        const listResult = convertToOutline(nextChild!, paragraphDepth + 1, options);
        if (listResult) results.push(listResult);
      } else {
        // Regular paragraph processing
        // If this paragraph follows a heading, indent it under the heading
        // Otherwise, use base depth
        const paragraphDepth = lastHeadingDepth > baseDepth ? lastHeadingDepth + 1 : baseDepth;
        const paragraphResult = convertToOutline(child, paragraphDepth, options);
        if (paragraphResult) results.push(paragraphResult);
      }
    } else {
      // For other non-heading content, indent under the last heading if there is one
      const contentDepth = lastHeadingDepth > baseDepth ? lastHeadingDepth + 1 : baseDepth;
      const contentResult = convertToOutline(child, contentDepth, options);
      if (contentResult) results.push(contentResult);
    }
  }

  // Performance: Use join directly instead of filter then join
  return results.join('\n');
}
