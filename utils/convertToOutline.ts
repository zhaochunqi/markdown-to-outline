import type { Node } from 'unist';

export interface MarkdownNode extends Node {
  children?: MarkdownNode[];
  depth?: number;
  value?: string;
  lang?: string | null;
  url?: string | null;
  type: string;
  ordered?: boolean;
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

      case 'linkReference':
        const linkText = node.children?.[0]?.value || '';
        const identifier = (node as any).identifier || '';
        return `[${linkText}][${identifier}]`;

      case 'emphasis':
        if (!node.children) return '';
        return `*${node.children.map(processTextContent).join('')}*`;

      case 'strong':
        if (!node.children) return '';
        return `**${node.children.map(processTextContent).join('')}**`;

      case 'inlineCode':
        return `\`${node.value || ''}\``;

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

      // Filter out definition nodes as they are just link definitions
      const filteredChildren = (node.children as MarkdownNode[]).filter(
        child => child.type !== 'definition'
      );
      return processChildrenWithHierarchy(filteredChildren, depth, options);

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

      // Split paragraph content by newlines and create bullet points for each part
      const parts = trimmedContent
        .split('\n')
        .map(part => part.trim())
        .filter(Boolean);
      if (parts.length === 0) return '';

      return parts
        .map((part, index) => {
          if (index === 0) {
            return `${getIndent(depth)}- ${part}`;
          } else {
            // For subsequent parts in the same paragraph, no bullet prefix
            return part;
          }
        })
        .join('\n');

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

      const results: string[] = [];
      let firstParagraphAdded = false;

      for (const child of node.children as MarkdownNode[]) {
        if (child.type === 'paragraph') {
          const content = (child.children as any[])
            .map(processTextContent)
            .filter(Boolean)
            .join('');
          const trimmedContent = content.trim();

          if (trimmedContent) {
            // Split content by newlines to handle multiple paragraphs in one list item
            const parts = trimmedContent
              .split('\n')
              .map(part => part.trim())
              .filter(Boolean);

            parts.forEach((part, index) => {
              if (!firstParagraphAdded) {
                // First part - process it with the list item
                let finalContent = part;

                if (options.convertToLogseqTodo) {
                  const todoUncheckedRegex = /^\s*\[ \]\s*(.*)/;
                  const matchUnchecked = finalContent.match(todoUncheckedRegex);
                  if (matchUnchecked) {
                    finalContent = `TODO ${matchUnchecked[1]}`;
                  } else {
                    const todoCheckedRegex = /^\s*\[x\]\s*(.*)/i;
                    const matchChecked = finalContent.match(todoCheckedRegex);
                    if (matchChecked) {
                      finalContent = `DONE ${matchChecked[1]}`;
                    }
                  }
                }

                results.push(`${getIndent(depth)}- ${finalContent}`);
                firstParagraphAdded = true;
              } else {
                // Additional parts - treat as separate bullet points with indentation
                results.push(`${getIndent(depth + 1)}- ${part}`);
              }
            });
          }
        } else if (child.type === 'list') {
          // For nested lists, indent them as children of the current list item
          const childContent = convertToOutline(child, depth + 1, options);
          if (childContent) {
            results.push(childContent);
          }
        } else {
          // For other non-paragraph children (like code blocks), create separate bullet points
          // If we haven't added the first paragraph yet and this is the first non-paragraph child,
          // it means there was no paragraph, so just process this child
          if (!firstParagraphAdded && results.length === 0) {
            // No paragraph found yet, just process this child as a regular item
            const childContent = convertToOutline(child, depth, options);
            if (childContent) {
              results.push(childContent);
            }
          } else {
            // Add the child content as a separate bullet point at the same level as the first paragraph
            const childContent = convertToOutline(child, depth, options);
            if (childContent) {
              results.push(childContent);
            }
          }
        }
      }

      return results.join('\n');

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
            // 使用 processTextContent 处理所有子节点，包括 strong 等格式
            return (child.children as any[]).map(processTextContent).join('').replace(/<br>/g, '');
          }
          return '';
        })
        .filter(Boolean);

      if (quoteContent.length === 0) return '';

      // Handle multi-line content by splitting on newlines
      const allLines: string[] = [];
      quoteContent.forEach(content => {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.trim()) {
            allLines.push(line.trim());
          }
        });
      });

      if (allLines.length === 0) return '';

      // Each line gets its own bullet point
      return allLines.map(line => `${getIndent(depth)}- > ${line}`).join('\n');

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
  let lastHeadingDepth = -1; // Start with -1 so first heading at level 1 becomes depth 0

  // Performance: Pre-allocate array with estimated size
  results.length = 0;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    // Performance: Skip empty or invalid nodes early
    if (!child || !child.type) continue;

    if (child.type === 'heading') {
      // For headings, map heading levels to outline depths
      const headingLevel = (child as any).depth;
      // Map h1->0, h2->1, h3->2, h4->3, etc.
      lastHeadingDepth = headingLevel - 1;

      // Special handling: if this is the first heading and not h1, treat it as top level
      let headingDepth = lastHeadingDepth;
      if (results.length === 0 && headingLevel > 1) {
        headingDepth = 0; // Treat as top level
        lastHeadingDepth = 0; // Also update lastHeadingDepth for subsequent calculations
      }

      const headingResult = convertToOutline(child, headingDepth, options);
      if (headingResult) results.push(headingResult);
    } else if (child.type === 'paragraph') {
      // Look ahead to see if this paragraph is followed by a list
      const nextChild = i + 1 < children.length ? children[i + 1] : null;
      const isFollowedByList = nextChild?.type === 'list';

      if (isFollowedByList) {
        // This paragraph should be a parent of the following list
        // Paragraphs that follow headings should be indented under them
        const paragraphDepth = lastHeadingDepth >= 0 ? lastHeadingDepth + 1 : baseDepth;
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
        const paragraphDepth = lastHeadingDepth >= 0 ? lastHeadingDepth + 1 : baseDepth;
        const paragraphResult = convertToOutline(child, paragraphDepth, options);
        if (paragraphResult) results.push(paragraphResult);
      }
    } else if (child.type === 'list') {
      // For lists, use the heading depth + 1, but ensure minimum depth for readability
      let listDepth = lastHeadingDepth >= 0 ? Math.max(1, lastHeadingDepth) : baseDepth;

      // Collect consecutive list nodes
      const consecutiveLists: MarkdownNode[] = [child];
      while (i + 1 < children.length && children[i + 1].type === 'list') {
        consecutiveLists.push(children[i + 1]);
        i++; // Skip the next consecutive list
      }

      // Process consecutive lists with proper hierarchy
      // We need to pair ordered lists with their following unordered lists
      for (let j = 0; j < consecutiveLists.length; j++) {
        const currentList = consecutiveLists[j];
        const isOrdered = (currentList as any).ordered;
        const nextList = j + 1 < consecutiveLists.length ? consecutiveLists[j + 1] : null;
        const isNextUnordered = nextList && !(nextList as any).ordered;

        if (isOrdered && isNextUnordered) {
          // This is a paired structure: ordered list + unordered list
          // Process ordered list items as parent items
          const orderedItems = (currentList as any).children || [];
          const unorderedItems = (nextList as any).children || [];

          // Process each ordered item with its corresponding unordered item
          const maxItems = Math.max(orderedItems.length, unorderedItems.length);
          for (let k = 0; k < maxItems; k++) {
            // Process ordered list item (parent)
            if (k < orderedItems.length) {
              const orderedItem = convertToOutline(orderedItems[k], listDepth, options);
              if (orderedItem) results.push(orderedItem);
            }

            // Process unordered list item as child (with deeper indentation)
            if (k < unorderedItems.length) {
              const unorderedItem = convertToOutline(unorderedItems[k], listDepth + 1, options);
              if (unorderedItem) results.push(unorderedItem);
            }
          }

          j++; // Skip the next list since we processed it as a pair
        } else if (isOrdered) {
          // Single ordered list without following unordered list
          const listResult = convertToOutline(currentList, listDepth, options);
          if (listResult) results.push(listResult);
        } else if (!isOrdered && j === 0) {
          // First list is unordered, process at current depth
          const listResult = convertToOutline(currentList, listDepth, options);
          if (listResult) results.push(listResult);
        } else if (!isOrdered && j > 0 && !consecutiveLists[j - 1]) {
          // Unordered list without preceding ordered list
          const listResult = convertToOutline(currentList, listDepth, options);
          if (listResult) results.push(listResult);
        }
      }
    } else {
      // For other non-heading content, indent under the last heading if there is one
      const contentDepth = lastHeadingDepth >= 0 ? lastHeadingDepth + 1 : baseDepth;
      const contentResult = convertToOutline(child, contentDepth, options);
      if (contentResult) results.push(contentResult);
    }
  }

  // Performance: Use join directly instead of filter then join
  return results.join('\n');
}
