/**
 * Integration test for Logseq to Markdown conversion
 * Tests the complete pipeline from parsing to conversion
 */

import { parseLogseqOutline } from './parseLogseqOutline';
import { convertLogseqToMarkdown } from './convertLogseqToMarkdown';

// Test the complete pipeline
const testInput = `- ## Project Overview
  - ### Goals
    - Improve performance
    - TODO Add new features
  - ### Timeline
    - DONE Phase 1 completed
    - TODO Start Phase 2
- ## Technical Details
  - ### Frontend
    - React with TypeScript
    - TODO Implement responsive design
  - ### Backend
    - Node.js API
    - DONE Database setup`;

console.log('=== Integration Test: Logseq Parsing + Markdown Conversion ===\n');

console.log('1. Input (Logseq format):');
console.log(testInput);
console.log();

console.log('2. Parsing result:');
try {
  const parsed = parseLogseqOutline(testInput);
  console.log(`Parsed ${parsed.length} root nodes:`);
  
  const showStructure = (nodes: any[], indent = 0) => {
    nodes.forEach(node => {
      const prefix = '  '.repeat(indent);
      console.log(`${prefix}- [${node.type}] "${node.content}" (Level ${node.level})`);
      if (node.children.length > 0) {
        showStructure(node.children, indent + 1);
      }
    });
  };
  
  showStructure(parsed);
} catch (error) {
  console.log(`Parsing error: ${error}`);
}

console.log();

console.log('3. Conversion result:');
try {
  const converted = convertLogseqToMarkdown(testInput, {
    convertTodoItems: true,
    useTaskListFormat: true,
  });
  console.log(converted);
} catch (error) {
  console.log(`Conversion error: ${error}`);
}

console.log();

console.log('4. Alternative conversion (bold TODO format):');
try {
  const converted = convertLogseqToMarkdown(testInput, {
    convertTodoItems: true,
    useTaskListFormat: false,
  });
  console.log(converted);
} catch (error) {
  console.log(`Conversion error: ${error}`);
}

console.log('\n=== Integration Test Complete ===');