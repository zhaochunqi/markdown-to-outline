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

  // 计算缩进
  const getIndent = (d: number) => '  '.repeat(Math.max(0, d));

  // 处理文本内容
  const processTextContent = (node: any): string => {
    if (node.type === 'text') {
      // 检查是否有待办项格式 [ ] xxxx
      if (options.convertToLogseqTodo && node.value) {
        const todoRegex = /^[\[\s?]\]\s+(.+)$/;
        const match = node.value.match(todoRegex);
        if (match) {
          return `TODO ${match[1]}`;
        }
      }
      return node.value;
    }
    if (node.type === 'link') return `[${node.children[0].value}](${node.url})`;
    if (node.type === 'emphasis') return `*${node.children.map(processTextContent).join('')}*`;
    if (node.type === 'strong') return `**${node.children.map(processTextContent).join('')}**`;
    if (node.type === 'inlineCode') return `${node.value}`;
    if (node.type === 'code') return `${node.lang || ''}${node.value}`;
    return '';
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

      return processChildrenWithHierarchy(
        node.children as MarkdownNode[],
        depth,
        options
      );

    case 'heading':
      if (!('depth' in node) || !('children' in node)) {
        throw new Error(`Invalid heading node: ${JSON.stringify(node)}`);
      }
      
      const headingLevel = node.depth as number;
      const headerMarker = options.removeHeaderMarkers
        ? ''
        : '#'.repeat(headingLevel) + ' ';
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
      // 将代码内容按行分割，每行都添加缩进
      const lines = (node as any).value.split('\n');
      const indentedLines = lines.map((line: string) => `${getIndent(depth + 2)}${line}`); // 代码内容再多缩进一级
      const codeContent = '```' + ((node as any).lang || '') + '\n' + indentedLines.join('\n') + '\n' + getIndent(depth + 1) + '```';
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
 * Processes children nodes while maintaining proper hierarchy
 */
function processChildrenWithHierarchy(
  children: MarkdownNode[],
  baseDepth: number,
  options: ConvertOptions
): string {
  const results: string[] = [];
  let currentHeadingLevel = 0;
  let currentDepth = baseDepth;
  
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    
    if (child.type === 'heading') {
      const headingLevel = (child as any).depth;
      
      // Calculate the depth for this heading based on its level
      if (currentHeadingLevel === 0) {
        // First heading starts at base depth
        currentDepth = baseDepth;
      } else if (headingLevel > currentHeadingLevel) {
        // Deeper heading - increase depth
        currentDepth = baseDepth + headingLevel - 1;
      } else if (headingLevel <= currentHeadingLevel) {
        // Same level or higher level heading - adjust depth
        currentDepth = baseDepth + headingLevel - 1;
      }
      
      currentHeadingLevel = headingLevel;
      
      const headingResult = convertToOutline(child, currentDepth, options);
      if (headingResult) results.push(headingResult);
    } else {
      // For non-heading content, indent one level deeper than current heading
      const contentDepth = currentHeadingLevel > 0 ? currentDepth + 1 : baseDepth;
      const contentResult = convertToOutline(child, contentDepth, options);
      if (contentResult) results.push(contentResult);
    }
  }
  
  return results.filter(Boolean).join('\n');
}
