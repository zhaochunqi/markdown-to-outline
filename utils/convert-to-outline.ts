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

interface TextNode {
  type: 'text';
  value?: string;
}

interface LinkNode extends MarkdownNode {
  type: 'link';
  url?: string | null;
  children?: TextNode[];
}

interface LinkReferenceNode extends MarkdownNode {
  type: 'linkReference';
  identifier?: string;
  children?: TextNode[];
}

interface EmphasisNode extends MarkdownNode {
  type: 'emphasis' | 'strong';
  children?: (TextNode | EmphasisNode)[];
}

interface InlineCodeNode extends MarkdownNode {
  type: 'inlineCode';
  value?: string;
}

interface CodeNode extends MarkdownNode {
  type: 'code';
  value?: string;
  lang?: string | null;
}

interface HtmlNode extends MarkdownNode {
  type: 'html';
  value?: string;
}

interface YamlNode extends MarkdownNode {
  type: 'yaml';
  value?: string;
}

interface ListNode extends MarkdownNode {
  type: 'list';
  ordered?: boolean;
  children?: MarkdownNode[];
}

interface ParagraphNode extends MarkdownNode {
  type: 'paragraph';
  children?: (TextNode | LinkNode | EmphasisNode | InlineCodeNode)[];
}

interface BlockquoteNode extends MarkdownNode {
  type: 'blockquote';
  children?: ParagraphNode[];
}

interface HeadingNode extends MarkdownNode {
  type: 'heading';
  depth: number;
  children?: (TextNode | EmphasisNode | LinkNode)[];
}

type ProcessableNode =
  | TextNode
  | LinkNode
  | LinkReferenceNode
  | EmphasisNode
  | InlineCodeNode
  | CodeNode
  | HtmlNode;

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
  const processTextContent = (node: ProcessableNode): string => formatTextContent(node, options);

  switch (node.type) {
    case 'yaml':
      if (options.ignoreYamlFrontmatter) {
        return '';
      }
      return `${getIndent(depth)}- ${(node as YamlNode).value || ''}`;

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
      const headingContent = (node.children as ProcessableNode[])
        .map(processTextContent)
        .filter(Boolean)
        .join('');

      return `${getIndent(depth)}- ${headerMarker}${headingContent}`;

    case 'paragraph':
      if (!('children' in node)) {
        throw new Error(`Invalid paragraph node: ${JSON.stringify(node)}`);
      }
      const paragraphContent = (node.children as ProcessableNode[])
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
            // For subsequent parts in the same paragraph, check for special cases
            if (part.includes('|') && part.includes('`') && part.includes('id::')) {
              return `${getIndent(depth)}- ${part}`;
            } else {
              // For subsequent parts in the same paragraph, no bullet prefix
              return part;
            }
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
          const content = (child.children as ProcessableNode[])
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
                // Special case: table continuation content should maintain same indentation level
                if (part.includes('|') && part.includes('`') && part.includes('id::')) {
                  results.push(`${getIndent(depth)}- ${part}`);
                } else {
                  results.push(`${getIndent(depth + 1)}- ${part}`);
                }
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
      const codeValue = (node as CodeNode).value || '';
      const codeLang = (node as CodeNode).lang || '';

      if (!codeValue) {
        return `${getIndent(depth)}- \`\`\`${codeLang}\n${getIndent(depth + 1)}\`\`\``;
      }

      // Performance: Use more efficient string building for large code blocks
      const lines = codeValue.split('\n');
      const baseIndent = getIndent(depth + 2);
      const indentedLines = lines.map((line: string) => `${baseIndent}${line}`);
      const codeContent = `\`\`\`${codeLang}\n${indentedLines.join('\n')}\n${getIndent(depth + 1)}\`\`\``;
      return `${getIndent(depth)}- ${codeContent}`;

    case 'thematicBreak':
      return `${getIndent(depth)}- ---`;

    case 'blockquote':
      if (!('children' in node)) {
        throw new Error(`Invalid blockquote node: ${JSON.stringify(node)}`);
      }
      const quoteContent = (node.children as MarkdownNode[])
        .map(child => {
          if (child.type === 'paragraph') {
            // 使用 processTextContent 处理所有子节点，包括 strong 等格式
            return (child.children as ProcessableNode[])
              .map(processTextContent)
              .join('')
              .replace(/<br>/g, '');
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
  let firstHeadingEncountered = false;
  let firstHeadingLevel = 0; // Store the level of the first heading for hierarchy normalization
  let nestedContinuationDepth: number | null = null;
  let pendingBlockBodyDepth: number | null = null;

  // Performance: Pre-allocate array with estimated size
  results.length = 0;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    // Performance: Skip empty or invalid nodes early
    if (!child || !child.type) continue;

    if (child.type === 'heading') {
      // For headings, map heading levels to outline depths
      const headingLevel = (child as HeadingNode).depth;

      // Handle first heading normalization
      if (!firstHeadingEncountered) {
        firstHeadingEncountered = true;
        firstHeadingLevel = headingLevel;
      }

      // Normalize heading depth relative to first heading
      // If first heading is h4, then h4 -> 0, h5 -> 1, etc.
      // If first heading is h1, then h1 -> 0, h2 -> 1, etc.
      const normalizedHeadingLevel = headingLevel - firstHeadingLevel;

      // Ensure minimum depth of 0
      lastHeadingDepth = Math.max(0, normalizedHeadingLevel);
      nestedContinuationDepth = null;
      pendingBlockBodyDepth = null;

      const headingResult = convertToOutline(child, lastHeadingDepth, options);
      if (headingResult) results.push(headingResult);

      // Check if this heading follows a thematicBreak and looks like frontmatter (key: value format)
      // If so, we need to insert a trailing thematicBreak to preserve the original structure
      if (i > 0 && children[i - 1].type === 'thematicBreak') {
        const headingText = (child.children as ProcessableNode[])
          ?.map((n: ProcessableNode) => (n.type === 'text' ? n.value : ''))
          .join('')
          .trim();

        const frontmatterPattern = /^[a-zA-Z_][a-zA-Z0-9_-]*:\s*.+/;
        if (headingText && frontmatterPattern.test(headingText) && !headingText.startsWith('#')) {
          const thematicResult = `${getIndent(baseDepth)}- ---`;
          results.push(thematicResult);
        }
      }
    } else if (child.type === 'paragraph') {
      // Regular paragraph processing
      // If this paragraph follows a heading, indent it under the heading
      // Otherwise, use base depth
      let paragraphDepth = baseDepth;
      const existingContinuationDepth = nestedContinuationDepth;

      // Check if the previous element was a thematic break, which indicates a section break
      const prevElement = i > 0 ? children[i - 1] : null;
      const hasPreviousThematicBreak = prevElement?.type === 'thematicBreak';

      // Special case: if this is before the first heading, treat it as base content
      if (!firstHeadingEncountered) {
        paragraphDepth = baseDepth;
      } else if (lastHeadingDepth >= 0 && !hasPreviousThematicBreak) {
        // Paragraphs that follow headings should be indented under them
        paragraphDepth = lastHeadingDepth + 1;
      }

      if (nestedContinuationDepth !== null) {
        paragraphDepth = nestedContinuationDepth;
      }

      const paragraphConversion = convertParagraphForHierarchy(child, paragraphDepth, options);
      const paragraphResult = paragraphConversion.result;
      if (paragraphResult) results.push(paragraphResult);

      nestedContinuationDepth =
        paragraphConversion.followingSiblingDepth ?? nestedContinuationDepth;
      pendingBlockBodyDepth = paragraphIntroducesChildList(child)
        ? (existingContinuationDepth ?? paragraphDepth + 1)
        : null;
    } else if (child.type === 'list') {
      // For lists, use the heading depth + 1, but ensure minimum depth for readability
      let listDepth =
        nestedContinuationDepth ?? (lastHeadingDepth >= 0 ? lastHeadingDepth + 1 : baseDepth);
      const prevElement = i > 0 ? children[i - 1] : null;

      if (prevElement?.type === 'paragraph' && paragraphIntroducesChildList(prevElement)) {
        listDepth += 1;
      }

      const isOrdered = (child as ListNode).ordered;

      // Check if this is an ordered list followed by unordered list(s)
      if (
        isOrdered &&
        i + 1 < children.length &&
        children[i + 1].type === 'list' &&
        !(children[i + 1] as ListNode).ordered
      ) {
        // This is an ordered list followed by unordered list(s)
        // We need to merge them into a single list structure where the unordered list
        // is nested under the last ordered list item

        // Create a merged list node that contains both the ordered and unordered items
        const orderedList = child as ListNode;
        const unorderedList = children[i + 1] as ListNode;

        const mergedList: ListNode = {
          type: 'list',
          ordered: true,
          children: [...(orderedList.children || [])],
        };

        // Add the unordered list items as a nested list under the last ordered item
        const lastOrderedItem = orderedList.children?.[orderedList.children?.length - 1];
        if (lastOrderedItem) {
          // Create a new last ordered item that includes the nested unordered list
          const newLastOrderedItem = {
            ...lastOrderedItem,
            children: [...(lastOrderedItem.children || []), unorderedList],
          };
          // Replace the last item in the merged list
          mergedList.children![mergedList.children!.length - 1] = newLastOrderedItem;
        }

        // Process the merged list
        const mergedResult = convertToOutline(mergedList, listDepth, options);
        if (mergedResult) results.push(mergedResult);
        pendingBlockBodyDepth = listDepth + 1;

        // Skip the next unordered list since we've merged it
        i++;
      } else {
        // Single list or unordered list, process normally
        const listResult = convertToOutline(child, listDepth, options);
        if (listResult) results.push(listResult);
        pendingBlockBodyDepth = isOrdered ? listDepth + 1 : nestedContinuationDepth;
      }
    } else if (child.type === 'thematicBreak') {
      // Thematic breaks should be at the same level as headings, not indented
      const thematicResult = convertToOutline(
        child,
        lastHeadingDepth >= 0 ? lastHeadingDepth : baseDepth,
        options
      );
      if (thematicResult) results.push(thematicResult);

      // Reset the heading depth after a thematic break to prevent subsequent paragraphs
      // from being indented under the previous heading
      lastHeadingDepth = -1;
      nestedContinuationDepth = null;
      pendingBlockBodyDepth = null;
    } else if (child.type === 'code' && pendingBlockBodyDepth !== null) {
      const codeResult = convertCodeAsBlockBody(child as CodeNode, pendingBlockBodyDepth);
      if (codeResult) results.push(codeResult);
      pendingBlockBodyDepth = null;
    } else if (child.type === 'blockquote' && pendingBlockBodyDepth !== null) {
      const blockquoteResult = convertToOutline(child, pendingBlockBodyDepth, options);
      if (blockquoteResult) results.push(blockquoteResult);
      pendingBlockBodyDepth = null;
    } else {
      // For other non-heading content, indent under the last heading if there is one
      const contentDepth =
        nestedContinuationDepth ?? (lastHeadingDepth >= 0 ? lastHeadingDepth + 1 : baseDepth);
      const contentResult = convertToOutline(child, contentDepth, options);
      if (contentResult) results.push(contentResult);
      pendingBlockBodyDepth = null;
    }
  }

  // Performance: Use join directly instead of filter then join
  return results.join('\n');
}

function paragraphIntroducesChildList(node: MarkdownNode): boolean {
  if (node.type !== 'paragraph' || !('children' in node)) {
    return false;
  }

  const content = (node.children as ProcessableNode[]).map(getPlainTextContent).join('').trim();
  return content.endsWith(':') || content.endsWith('：');
}

function getPlainTextContent(node: ProcessableNode): string {
  switch (node.type) {
    case 'text':
      return node.value || '';

    case 'link':
    case 'linkReference':
      return node.children?.map(child => child.value || '').join('') || '';

    case 'emphasis':
    case 'strong':
      return (
        node.children?.map(child => getPlainTextContent(child as ProcessableNode)).join('') || ''
      );

    case 'inlineCode':
      return node.value || '';

    default:
      return '';
  }
}

function formatTextContent(node: ProcessableNode, options: ConvertOptions): string {
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
      const identifier = (node as LinkReferenceNode).identifier || '';
      return `[${linkText}][${identifier}]`;

    case 'emphasis':
      if (!node.children) return '';
      return `*${node.children.map(child => formatTextContent(child as ProcessableNode, options)).join('')}*`;

    case 'strong':
      if (!node.children) return '';
      return `**${node.children.map(child => formatTextContent(child as ProcessableNode, options)).join('')}**`;

    case 'inlineCode':
      return `\`${node.value || ''}\``;

    case 'code':
      return `${node.lang || ''}${node.value || ''}`;

    case 'html':
      // Handle HTML break tags to preserve line structure
      if (node.value === '<br>' || node.value === '<br/>') {
        return '\n';
      }
      return '';

    default:
      return '';
  }
}

function convertParagraphForHierarchy(
  node: MarkdownNode,
  depth: number,
  options: ConvertOptions
): { result: string; followingSiblingDepth?: number } {
  if (node.type !== 'paragraph' || !('children' in node)) {
    return { result: convertToOutline(node, depth, options) };
  }

  const paragraphContent = (node.children as ProcessableNode[])
    .map(child => formatTextContent(child, options))
    .filter(Boolean)
    .join('');
  const trimmedContent = paragraphContent.trim();
  if (!trimmedContent) return { result: '' };

  const parts = trimmedContent
    .split('\n')
    .map(part => part.trim())
    .filter(Boolean);

  if (!parts.some(part => /^\d+\.\s+/.test(part))) {
    return { result: convertToOutline(node, depth, options) };
  }

  const results: string[] = [];
  let continuationDepth: number | null = null;
  let followingSiblingDepth: number | undefined;

  for (const part of parts) {
    const orderedItemMatch = part.match(/^\d+\.\s+(.+)$/);

    if (orderedItemMatch) {
      results.push(`${getIndent(depth)}- ${orderedItemMatch[1]}`);
      continuationDepth = depth + 1;
      followingSiblingDepth = continuationDepth;
      continue;
    }

    if (continuationDepth !== null) {
      results.push(`${getIndent(continuationDepth)}- ${part}`);
      followingSiblingDepth = continuationDepth + 1;
    } else {
      results.push(`${getIndent(depth)}- ${part}`);
    }
  }

  return { result: results.join('\n'), followingSiblingDepth };
}

function convertCodeAsBlockBody(node: CodeNode, depth: number): string {
  const codeValue = node.value || '';
  const codeLang = node.lang || '';

  if (!codeValue) {
    return `${getIndent(depth)}-\n${getIndent(depth + 1)}\`\`\`${codeLang}\n${getIndent(depth + 1)}\`\`\``;
  }

  const lines = codeValue.split('\n');
  const baseIndent = getIndent(depth + 2);
  const indentedLines = lines.map((line: string) => `${baseIndent}${line}`);
  return `${getIndent(depth)}-\n${getIndent(depth + 1)}\`\`\`${codeLang}\n${indentedLines.join('\n')}\n${getIndent(depth + 1)}\`\`\``;
}
