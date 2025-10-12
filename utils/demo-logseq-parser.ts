/**
 * Demonstration of Logseq Outline Parser functionality
 * This file can be used to test the parser during development
 */

import {
  parseLogseqOutline,
  identifyTodoItems,
  getLogseqHierarchy,
  validateLogseqFormat,
} from './parseLogseqOutline';

// Sample Logseq outline content for testing
const sampleLogseqContent = `- ## 我擅长的技能
  - ### 写作
    - 我热爱文字创作，具备不错的写作与书面表达能力。
    - TODO 完善写作作品集
  - ### 编程
    - 熟悉多种编程语言
    - DONE 学习 TypeScript 基础
    - TODO 深入学习 React 高级特性
- ## 工作经验
  - ### 前端开发
    - 负责用户界面设计和实现
    - 使用现代前端框架开发应用
  - ### 项目管理
    - TODO 完成项目文档整理
    - DONE 制定项目时间表`;

/**
 * Demonstrates the parser functionality
 */
export function demonstrateLogseqParser() {
  console.log('=== Logseq Outline Parser Demo ===\n');
  
  console.log('Original Logseq Content:');
  console.log(sampleLogseqContent);
  console.log('\n' + '='.repeat(50) + '\n');

  // 1. Parse the outline
  console.log('1. Parsing Logseq Outline:');
  const parsedNodes = parseLogseqOutline(sampleLogseqContent);
  console.log(`Parsed ${parsedNodes.length} root nodes`);
  
  // Display structure
  parsedNodes.forEach((node, index) => {
    console.log(`  Node ${index + 1}: ${node.type} - "${node.content}" (Level ${node.level})`);
    if (node.children.length > 0) {
      console.log(`    Has ${node.children.length} children`);
    }
  });
  console.log();

  // 2. Identify TODO items
  console.log('2. Identifying TODO/DONE Items:');
  const { todos, dones, regular } = identifyTodoItems(parsedNodes);
  console.log(`  TODO items: ${todos.length}`);
  todos.forEach(todo => console.log(`    - TODO: ${todo.content}`));
  console.log(`  DONE items: ${dones.length}`);
  dones.forEach(done => console.log(`    - DONE: ${done.content}`));
  console.log(`  Regular items: ${regular.length}`);
  console.log();

  // 3. Analyze hierarchy
  console.log('3. Hierarchy Analysis:');
  const hierarchy = getLogseqHierarchy(parsedNodes);
  console.log(`  Max depth: ${hierarchy.maxDepth}`);
  console.log(`  Structure: ${hierarchy.structure}`);
  console.log();

  // 4. Validate format
  console.log('4. Format Validation:');
  const validation = validateLogseqFormat(sampleLogseqContent);
  console.log(`  Is valid: ${validation.isValid}`);
  if (validation.errors.length > 0) {
    console.log('  Errors:');
    validation.errors.forEach(error => console.log(`    - ${error}`));
  }
  if (validation.warnings.length > 0) {
    console.log('  Warnings:');
    validation.warnings.forEach(warning => console.log(`    - ${warning}`));
  }
  console.log();

  console.log('=== Demo Complete ===');
  
  return {
    parsedNodes,
    todos,
    dones,
    regular,
    hierarchy,
    validation,
  };
}

// Export for potential use in other files
export { sampleLogseqContent };