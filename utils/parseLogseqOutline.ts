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

/**
 * Identifies TODO/DONE items in Logseq format
 */
export function identifyTodoItems(nodes: LogseqNode[]): {
  todos: LogseqNode[];
  dones: LogseqNode[];
  regular: LogseqNode[];
} {
  const todos: LogseqNode[] = [];
  const dones: LogseqNode[] = [];
  const regular: LogseqNode[] = [];

  function processNode(node: LogseqNode) {
    switch (node.type) {
      case 'todo':
        todos.push(node);
        break;
      case 'done':
        dones.push(node);
        break;
      default:
        regular.push(node);
        break;
    }

    // Process children recursively
    node.children.forEach(processNode);
  }

  nodes.forEach(processNode);

  return { todos, dones, regular };
}

/**
 * Gets the hierarchy structure of parsed nodes
 */
export function getLogseqHierarchy(nodes: LogseqNode[]): {
  maxDepth: number;
  levelCounts: Record<number, number>;
  structure: string;
} {
  let maxDepth = 0;
  const levelCounts: Record<number, number> = {};

  function analyzeNode(node: LogseqNode, depth: number = 0) {
    maxDepth = Math.max(maxDepth, depth);
    levelCounts[depth] = (levelCounts[depth] || 0) + 1;

    node.children.forEach(child => analyzeNode(child, depth + 1));
  }

  nodes.forEach(node => analyzeNode(node));

  // Generate structure representation
  const structure = Object.entries(levelCounts)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([level, count]) => `Level ${level}: ${count} items`)
    .join(', ');

  return { maxDepth, levelCounts, structure };
}

/**
 * Validates Logseq outline format
 */
export function validateLogseqFormat(content: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!content || typeof content !== 'string') {
    errors.push('Content must be a non-empty string');
    return { isValid: false, errors, warnings };
  }

  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    warnings.push('Content appears to be empty');
    return { isValid: true, errors, warnings };
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Check if line starts with proper bullet format
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('-')) {
      errors.push(`Line ${lineNumber}: Expected bullet point format (starting with '-')`);
      continue;
    }

    // Check indentation consistency (should be multiples of 2)
    const indentMatch = line.match(/^(\s*)/);
    const indentation = indentMatch ? indentMatch[1].length : 0;

    if (indentation % 2 !== 0) {
      warnings.push(`Line ${lineNumber}: Indentation should be multiples of 2 spaces`);
    }

    // Check for valid bullet format
    const bulletMatch = trimmed.match(/^-\s+(.*)$/);
    if (trimmed && !bulletMatch) {
      errors.push(`Line ${lineNumber}: Invalid bullet format. Expected '- content'`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
