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
}

export function convertToOutline(
  node: MarkdownNode,
  depth = 0,
  options: ConvertOptions = {
    removeHeaderMarkers: false,
    ignoreYamlFrontmatter: true,
  }
): string {
  if (!node || typeof node !== 'object') {
    throw new Error(`Invalid node: ${JSON.stringify(node)}`);
  }

  // 计算缩进
  const getIndent = (d: number) => '  '.repeat(Math.max(0, d));

  // 处理文本内容
  const processTextContent = (node: any): string => {
    if (node.type === 'text') return node.value;
    if (node.type === 'link') return `[${node.children[0].value}](${node.url})`;
    if (node.type === 'emphasis') return `*${node.children.map(processTextContent).join('')}*`;
    if (node.type === 'strong') return `**${node.children.map(processTextContent).join('')}**`;
    if (node.type === 'inlineCode') return `\`${node.value}\``;
    if (node.type === 'code') return `\`\`\`${node.lang || ''}\n${node.value}\n\`\`\``;
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

      return (node.children as MarkdownNode[])
        .map((child, index, array) => {
          // 检查下一个节点是否是列表
          const nextNode = array[index + 1];
          const hasListAfter = nextNode && nextNode.type === 'list';

          if (child.type === 'paragraph') {
            // 段落总是以 - 开头
            const paragraphContent = (child.children as any[])
              .map(processTextContent)
              .filter(Boolean)
              .join('');
            const trimmedContent = paragraphContent.trim();
            if (!trimmedContent) return '';
            return `${getIndent(depth)}- ${trimmedContent}`;
          } else if (child.type === 'list' && array[index - 1]?.type === 'paragraph') {
            // 如果是列表且前面是段落，增加缩进
            return convertToOutline(child, depth + 1, options);
          }

          // 其他情况保持当前缩进
          return convertToOutline(child, depth, options);
        })
        .filter(Boolean)
        .join('\n');

    case 'heading':
      if (!('depth' in node) || !('children' in node)) {
        throw new Error(`Invalid heading node: ${JSON.stringify(node)}`);
      }
      const headerMarker = options.removeHeaderMarkers
        ? ''
        : '#'.repeat(node.depth as number) + ' ';
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
        .map(item => convertToOutline(item, depth + 1, options))
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
          return convertToOutline(child, depth, options);
        })
        .filter(Boolean)
        .join('\n');
      return `${getIndent(depth)}- ${itemContent}`;

    case 'code':
      if (!('value' in node)) {
        throw new Error(`Invalid code node: ${JSON.stringify(node)}`);
      }
      // 将代码内容按行分割，每行都添加缩进
      const lines = (node as any).value.split('\n');
      const indentedLines = lines.map((line: string) => `${getIndent(depth + 2)}${line}`); // 代码内容再多缩进一级
      const codeContent = `\`\`\`${(node as any).lang || ''}\n${indentedLines.join('\n')}\n${getIndent(depth + 1)}\`\`\``; // 代码块标记缩进一级
      return `${getIndent(depth + 1)}- ${codeContent}`; // 整个代码块缩进一级

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
