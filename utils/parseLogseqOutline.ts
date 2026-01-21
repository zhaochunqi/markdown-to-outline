/**
 * Logseq Outline Parser
 * Parses Logseq-formatted outline text into structured data
 */

export interface LogseqNode {
  type: 'bullet' | 'todo' | 'done' | 'heading';
  level: number;
  content: string;
  indentation: number;
  children: LogseqNode[];
  raw: string;
}

export interface ParseLogseqOptions {
  preserveIndentation?: boolean;
  convertTodoItems?: boolean;
}

/**
 * Parses Logseq outline format into structured nodes
 */
export function parseLogseqOutline(
  logseqContent: string,
  options: ParseLogseqOptions = {
    preserveIndentation: true,
    convertTodoItems: true,
  }
): LogseqNode[] {
  if (!logseqContent || typeof logseqContent !== 'string') {
    return [];
  }

  const lines = logseqContent.split('\n');
  const nodes: LogseqNode[] = [];
  const nodeStack: LogseqNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      continue;
    }

    const parsedNode = parseLogseqLine(line, options);
    if (!parsedNode) {
      continue;
    }

    // For headings, keep the indentation-based level but store heading info
    // The indentation determines hierarchy, not the heading level

    // Determine the hierarchy level based on indentation and heading level
    const currentLevel = parsedNode.level;

    // Pop nodes from stack until we find the correct parent level
    while (nodeStack.length > 0 && nodeStack[nodeStack.length - 1].level >= currentLevel) {
      nodeStack.pop();
    }

    // Add to parent's children if there's a parent, otherwise add to root
    if (nodeStack.length > 0) {
      const parent = nodeStack[nodeStack.length - 1];
      parent.children.push(parsedNode);
    } else {
      nodes.push(parsedNode);
    }

    // Add current node to stack for potential children
    nodeStack.push(parsedNode);
  }

  return nodes;
}

/**
 * Parses a single line of Logseq outline format
 */
function parseLogseqLine(line: string, options: ParseLogseqOptions): LogseqNode | null {
  if (!line.trim()) {
    return null;
  }

  // Calculate indentation level (2 spaces = 1 level)
  const indentMatch = line.match(/^(\s*)/);
  const indentation = indentMatch ? indentMatch[1].length : 0;
  const level = Math.floor(indentation / 2);

  // Remove leading whitespace for content analysis
  const trimmedLine = line.trim();

  // Check if it's a bullet point (starts with -)
  const bulletMatch = trimmedLine.match(/^-\s+(.*)$/);
  if (!bulletMatch) {
    return null;
  }

  const content = bulletMatch[1];
  let nodeType: LogseqNode['type'] = 'bullet';
  let processedContent = content;

  if (options.convertTodoItems) {
    // Check for TODO items
    const todoMatch = content.match(/^TODO\s+(.*)$/);
    if (todoMatch) {
      nodeType = 'todo';
      processedContent = todoMatch[1];
    } else {
      // Check for DONE items
      const doneMatch = content.match(/^DONE\s+(.*)$/);
      if (doneMatch) {
        nodeType = 'done';
        processedContent = doneMatch[1];
      }
    }
  }

  // Check if it's a heading (contains # markers)
  const headingMatch = processedContent.match(/^(#{1,6})\s+(.*)$/);
  if (headingMatch) {
    nodeType = 'heading';
    // Keep the heading markers in the content for now
    processedContent = processedContent;
  }

  return {
    type: nodeType,
    level,
    content: processedContent,
    indentation,
    children: [],
    raw: line,
  };
}


