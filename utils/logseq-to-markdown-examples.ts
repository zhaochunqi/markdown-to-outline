/**
 * Examples demonstrating Logseq to Markdown conversion
 * This file shows the conversion capabilities with various input formats
 */

import { convertLogseqToMarkdown, type ConvertToMarkdownOptions } from './convertLogseqToMarkdown';

// Example 1: Basic TODO/DONE conversion
export const todoExample = `- Project Planning
  - TODO Define project scope
  - TODO Create timeline
    - DONE Research requirements
    - TODO Set milestones
  - DONE Initial meeting completed`;

// Example 2: Mixed content with headings
export const mixedContentExample = `- ## Project Overview
  - ### Goals and Objectives
    - Improve user experience
    - Increase performance
    - TODO Add accessibility features
  - ### Technical Requirements
    - Use TypeScript for type safety
    - Implement responsive design
    - DONE Set up build pipeline`;

// Example 3: Complex nested structure with Chinese content
export const chineseExample = `- ## 我擅长的技能
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

// Example 4: Code blocks and special formats
export const codeExample = `- Code Examples
  - JavaScript function:
    - \`\`\`javascript
      function greet(name) {
        console.log('Hello, ' + name);
      }
      \`\`\`
  - Python snippet:
    - \`\`\`python
      def calculate(x, y):
          return x + y
      \`\`\`
  - Inline code: Use \`console.log()\` for debugging`;

// Example 5: Blockquotes and mixed formats
export const quoteExample = `- Important Notes
  - Key principle:
    - > Always write clean, maintainable code
    - > Documentation is as important as the code itself
  - Best practices:
    - TODO Review code regularly
    - DONE Implement automated testing
    - > Code review is essential for quality`;

/**
 * Demonstrates different conversion options
 */
export function demonstrateConversionOptions() {
  const examples = [
    { name: 'TODO/DONE Items', content: todoExample },
    { name: 'Mixed Content with Headings', content: mixedContentExample },
    { name: 'Chinese Content', content: chineseExample },
    { name: 'Code Examples', content: codeExample },
    { name: 'Quotes and Mixed Formats', content: quoteExample },
  ];

  const conversionOptions: ConvertToMarkdownOptions[] = [
    {
      convertTodoItems: true,
      useTaskListFormat: true,
      preserveIndentation: true,
    },
    {
      convertTodoItems: true,
      useTaskListFormat: false,
      preserveIndentation: true,
    },
    {
      convertTodoItems: false,
      preserveIndentation: true,
    },
  ];

  console.log('=== Logseq to Markdown Conversion Examples ===\n');

  examples.forEach((example, exampleIndex) => {
    console.log(`${exampleIndex + 1}. ${example.name}:`);
    console.log('-'.repeat(60));
    
    console.log('Input (Logseq format):');
    console.log(example.content);
    console.log();

    conversionOptions.forEach((options, optionIndex) => {
      const optionName = optionIndex === 0 ? 'Task List Format' : 
                        optionIndex === 1 ? 'Bold TODO Format' : 
                        'No TODO Conversion';
      
      console.log(`Output (${optionName}):`);
      try {
        const result = convertLogseqToMarkdown(example.content, options);
        console.log(result);
      } catch (error) {
        console.log(`Error: ${error}`);
      }
      console.log();
    });

    console.log('='.repeat(80) + '\n');
  });
}

/**
 * Test specific conversion scenarios
 */
export function testConversionScenarios() {
  console.log('=== Testing Specific Conversion Scenarios ===\n');

  const scenarios = [
    {
      name: 'Deep nesting with mixed content',
      input: `- Level 1 Topic
  - Level 2 Subtopic
    - Level 3 Detail
      - Level 4 Specific point
        - Level 5 Very specific detail
    - TODO Another Level 3 task
  - DONE Level 2 completed task`,
    },
    {
      name: 'Only TODO/DONE items',
      input: `- TODO Task 1
- DONE Task 2
- TODO Task 3
  - TODO Subtask 3.1
  - DONE Subtask 3.2`,
    },
    {
      name: 'Mixed languages and formats',
      input: `- ## English Heading
  - ### 中文子标题
    - English content with Chinese: 这是一个例子
    - TODO Complete bilingual documentation
    - DONE 完成中文翻译`,
    },
    {
      name: 'Special characters and formatting',
      input: `- Special Characters: @#$%^&*()
  - Emojis: 🚀 🎯 ✅
    - TODO Add emoji support 😊
    - DONE Test special chars ✓`,
    },
  ];

  scenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. ${scenario.name}:`);
    console.log('-'.repeat(40));
    
    console.log('Input:');
    console.log(scenario.input);
    console.log();
    
    console.log('Output:');
    try {
      const result = convertLogseqToMarkdown(scenario.input);
      console.log(result);
    } catch (error) {
      console.log(`Error: ${error}`);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  });
}

// Export for use in other files
export const conversionExamples = {
  todoExample,
  mixedContentExample,
  chineseExample,
  codeExample,
  quoteExample,
};