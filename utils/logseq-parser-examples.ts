/**
 * Comprehensive examples demonstrating Logseq parser capabilities
 * This file shows how the parser handles different Logseq format structures
 */

import { parseLogseqOutline, validateLogseqFormat, identifyTodoItems } from './parseLogseqOutline';

// Example 1: Basic indented structure
export const basicIndentedExample = `- Level 0 item
  - Level 1 item
    - Level 2 item
      - Level 3 item
  - Another Level 1 item
- Another Level 0 item`;

// Example 2: TODO/DONE items at different levels
export const todoExample = `- Project Planning
  - TODO Define project scope
  - TODO Create timeline
    - DONE Research requirements
    - TODO Set milestones
  - DONE Initial meeting completed
- Development Phase
  - TODO Set up development environment
  - TODO Implement core features
    - DONE Create basic structure
    - TODO Add user interface
    - TODO Write tests`;

// Example 3: Mixed content with headings
export const mixedContentExample = `- ## Project Overview
  - ### Goals and Objectives
    - Improve user experience
    - Increase performance
    - TODO Add accessibility features
  - ### Technical Requirements
    - Use TypeScript for type safety
    - Implement responsive design
    - DONE Set up build pipeline
- ## Implementation Details
  - ### Frontend Development
    - React with Next.js
    - Tailwind CSS for styling
  - ### Backend Services
    - TODO Design API endpoints
    - DONE Set up database schema`;

// Example 4: Complex nested structure
export const complexNestedExample = `- ## 我擅长的技能
  - ### 写作
    - 我热爱文字创作，具备不错的写作与书面表达能力。
    - #### 写作类型
      - 技术文档
      - 创意写作
      - TODO 学习学术写作
    - #### 发表作品
      - DONE 完成第一篇技术博客
      - TODO 投稿技术期刊
  - ### 编程
    - 熟悉多种编程语言
    - #### 前端技术
      - React
      - Vue.js
      - TODO 学习 Svelte
    - #### 后端技术
      - Node.js
      - Python
      - DONE 掌握 TypeScript`;

/**
 * Demonstrates parsing of different Logseq structures
 */
export function demonstrateParsingCapabilities() {
  const examples = [
    { name: 'Basic Indented Structure', content: basicIndentedExample },
    { name: 'TODO/DONE Items', content: todoExample },
    { name: 'Mixed Content with Headings', content: mixedContentExample },
    { name: 'Complex Nested Structure', content: complexNestedExample },
  ];

  console.log('=== Logseq Parser Capabilities Demo ===\n');

  examples.forEach((example, index) => {
    console.log(`${index + 1}. ${example.name}:`);
    console.log('-'.repeat(40));
    
    // Parse the content
    const parsed = parseLogseqOutline(example.content);
    console.log(`Parsed ${parsed.length} root nodes`);
    
    // Show structure
    const showStructure = (nodes: any[], indent = 0) => {
      nodes.forEach(node => {
        const prefix = '  '.repeat(indent);
        console.log(`${prefix}- [${node.type}] ${node.content} (Level ${node.level})`);
        if (node.children.length > 0) {
          showStructure(node.children, indent + 1);
        }
      });
    };
    
    showStructure(parsed);
    
    // Identify TODO items
    const { todos, dones } = identifyTodoItems(parsed);
    if (todos.length > 0 || dones.length > 0) {
      console.log(`TODO items: ${todos.length}, DONE items: ${dones.length}`);
    }
    
    // Validate format
    const validation = validateLogseqFormat(example.content);
    console.log(`Format valid: ${validation.isValid}`);
    if (validation.errors.length > 0) {
      console.log(`Errors: ${validation.errors.length}`);
    }
    
    console.log();
  });
}

/**
 * Test edge cases and error handling
 */
export function testEdgeCases() {
  console.log('=== Testing Edge Cases ===\n');
  
  const edgeCases = [
    { name: 'Empty content', content: '' },
    { name: 'Only whitespace', content: '   \n  \n   ' },
    { name: 'Invalid bullet format', content: 'Not a bullet point\n- Valid bullet' },
    { name: 'Inconsistent indentation', content: '- Level 0\n - Odd indent\n  - Even indent' },
    { name: 'Mixed line endings', content: '- Item 1\r\n- Item 2\n- Item 3' },
  ];

  edgeCases.forEach(testCase => {
    console.log(`Testing: ${testCase.name}`);
    
    try {
      const parsed = parseLogseqOutline(testCase.content);
      const validation = validateLogseqFormat(testCase.content);
      
      console.log(`  Parsed nodes: ${parsed.length}`);
      console.log(`  Valid: ${validation.isValid}`);
      console.log(`  Errors: ${validation.errors.length}`);
      console.log(`  Warnings: ${validation.warnings.length}`);
    } catch (error) {
      console.log(`  Error: ${error}`);
    }
    
    console.log();
  });
}