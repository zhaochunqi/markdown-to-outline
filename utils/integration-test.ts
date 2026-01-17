/**
 * Integration test for Logseq to Markdown conversion
 * Tests the complete pipeline from parsing to conversion
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { convertToOutline } from './convertToOutline';
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

console.log('\n=== Blockquote Bug Fix Test ===');

// Test case for the blockquote bug fix
const blockquoteTestMarkdown = `简言之：  
> **"斯普特尼克时刻" = 危机感 + 觉醒 + 全面改革的起点**。`;

console.log('5. Blockquote test input:');
console.log(blockquoteTestMarkdown);
console.log();

console.log('6. Blockquote conversion result:');
try {
  const processor = unified().use(remarkParse);
  const tree = processor.parse(blockquoteTestMarkdown);
  const converted = convertToOutline(tree);
  console.log(converted);

  // Verify the fix
  const expected = '- 简言之：\n- > **"斯普特尼克时刻" = 危机感 + 觉醒 + 全面改革的起点**。';
  const passed = converted === expected;

  console.log();
  console.log(`7. Test result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  if (!passed) {
    console.log('Expected:');
    console.log(expected);
    console.log('Actual:');
    console.log(converted);
  }
} catch (error) {
  console.log(`Blockquote conversion error: ${error}`);
}

console.log('\n=== Blockquote Bug Fix Test Complete ===');

console.log('\n=== Additional Blockquote Tests ===');

// Test various blockquote scenarios
const additionalBlockquoteTests = [
  {
    name: 'Simple blockquote',
    input: '> This is a simple quote',
    expected: '- > This is a simple quote',
  },
  {
    name: 'Blockquote with emphasis',
    input: '> This has *italic* text',
    expected: '- > This has *italic* text',
  },
  {
    name: 'Blockquote with inline code',
    input: '> Use `const x = 1` in code',
    expected: '- > Use `const x = 1` in code',
  },
  {
    name: 'Multiple blockquotes',
    input: '> First quote\n\n> Second quote',
    expected: '- > First quote\n- > Second quote',
  },
  {
    name: 'Mixed content before and after blockquote',
    input: 'Paragraph before\n> Quote in middle\nParagraph after',
    expected: '- Paragraph before\n- > Quote in middle\nParagraph after',
  },
];

additionalBlockquoteTests.forEach((test, index) => {
  console.log(`${index + 1}. Testing: ${test.name}`);
  console.log(`Input: ${test.input}`);

  try {
    const processor = unified().use(remarkParse);
    const tree = processor.parse(test.input);
    const converted = convertToOutline(tree);

    const passed = converted === test.expected;
    console.log(`Result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);

    if (!passed) {
      console.log('Expected:');
      console.log(test.expected);
      console.log('Actual:');
      console.log(converted);
    }
  } catch (error) {
    console.log(`Error: ${error}`);
  }

  console.log();
});

console.log('=== Additional Blockquote Tests Complete ===');
