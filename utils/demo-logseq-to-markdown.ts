/**
 * Demo file to test Logseq to Markdown conversion
 * This file demonstrates the conversion functionality
 */

import { convertLogseqToMarkdown, validateMarkdownOutput, cleanupMarkdown } from './convertLogseqToMarkdown';

// Test examples
const examples = [
  {
    name: 'Basic bullet points',
    logseq: `- First item
- Second item
- Third item`,
  },
  {
    name: 'Nested structure',
    logseq: `- Main topic
  - Subtopic 1
    - Detail 1
    - Detail 2
  - Subtopic 2
    - Detail 3`,
  },
  {
    name: 'TODO/DONE items',
    logseq: `- Project tasks
  - TODO Complete documentation
  - DONE Set up project structure
  - TODO Write tests
    - DONE Create test files
    - TODO Write unit tests`,
  },
  {
    name: 'Mixed content with headings',
    logseq: `- ## Project Overview
  - ### Goals
    - Improve performance
    - TODO Add new features
  - ### Timeline
    - DONE Phase 1 completed
    - TODO Start Phase 2`,
  },
  {
    name: 'Complex Chinese example',
    logseq: `- ## 我擅长的技能
  - ### 写作
    - 我热爱文字创作，具备不错的写作与书面表达能力。
    - TODO 学习学术写作
  - ### 编程
    - 熟悉多种编程语言
    - DONE 掌握 TypeScript`,
  },
  {
    name: 'Code blocks and special formats',
    logseq: `- Code example
  - \`\`\`javascript
    console.log('Hello World');
    \`\`\`
  - Quote example
    - > This is a blockquote
    - > Multi-line quote`,
  },
];

/**
 * Run conversion demos
 */
export function runConversionDemo() {
  console.log('=== Logseq to Markdown Conversion Demo ===\n');

  examples.forEach((example, index) => {
    console.log(`${index + 1}. ${example.name}:`);
    console.log('-'.repeat(50));
    
    console.log('Input (Logseq):');
    console.log(example.logseq);
    console.log();
    
    try {
      // Convert with default options
      const markdown = convertLogseqToMarkdown(example.logseq);
      console.log('Output (Markdown):');
      console.log(markdown);
      console.log();
      
      // Validate output
      const validation = validateMarkdownOutput(markdown);
      console.log(`Valid: ${validation.isValid}`);
      if (validation.errors.length > 0) {
        console.log(`Errors: ${validation.errors.join(', ')}`);
      }
      if (validation.warnings.length > 0) {
        console.log(`Warnings: ${validation.warnings.join(', ')}`);
      }
      
      // Test with different options
      console.log('\nWith task list format:');
      const withTaskList = convertLogseqToMarkdown(example.logseq, {
        convertTodoItems: true,
        useTaskListFormat: true,
      });
      console.log(withTaskList);
      
    } catch (error) {
      console.log(`Error: ${error}`);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  });
}

/**
 * Test edge cases
 */
export function testEdgeCases() {
  console.log('=== Testing Edge Cases ===\n');
  
  const edgeCases = [
    { name: 'Empty input', content: '' },
    { name: 'Only whitespace', content: '   \n  \n   ' },
    { name: 'Single item', content: '- Single item' },
    { name: 'Deep nesting', content: '- Level 1\n  - Level 2\n    - Level 3\n      - Level 4\n        - Level 5' },
    { name: 'Mixed TODO formats', content: '- TODO Item 1\n- DONE Item 2\n- Regular item\n- TODO Item 3' },
  ];

  edgeCases.forEach(testCase => {
    console.log(`Testing: ${testCase.name}`);
    console.log('Input:', JSON.stringify(testCase.content));
    
    try {
      const result = convertLogseqToMarkdown(testCase.content);
      console.log('Output:', JSON.stringify(result));
      
      const validation = validateMarkdownOutput(result);
      console.log(`Valid: ${validation.isValid}`);
      
    } catch (error) {
      console.log(`Error: ${error}`);
    }
    
    console.log();
  });
}

/**
 * Test cleanup functionality
 */
export function testCleanup() {
  console.log('=== Testing Cleanup Functionality ===\n');
  
  const messyMarkdown = `# Heading



Content with too many blank lines


## Another Heading
- Valid item
- 
- Another valid item


More content`;

  console.log('Before cleanup:');
  console.log(JSON.stringify(messyMarkdown));
  
  const cleaned = cleanupMarkdown(messyMarkdown);
  console.log('\nAfter cleanup:');
  console.log(JSON.stringify(cleaned));
  
  console.log('\nCleaned output:');
  console.log(cleaned);
}

// Run demos if this file is executed directly
if (require.main === module) {
  runConversionDemo();
  testEdgeCases();
  testCleanup();
}