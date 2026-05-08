import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { convertToOutline, type MarkdownNode } from '../../convert-to-outline';

describe('Converter - Ordered List Code Block Regression Tests', () => {
  it('should convert ordered list items with code blocks into separate bullet points', () => {
    const input = `### **第一步：获取引用集合**

\`\`\`sql
-- 找出所有作为 target 被引用的 block_uuid
SELECT DISTINCT target_uuid FROM refs;

\`\`\`

### **第二步：获取有引用关系的 block 信息**`;

    const expected = `- ### **第一步：获取引用集合**
    - \`\`\`sql
        -- 找出所有作为 target 被引用的 block_uuid
        SELECT DISTINCT target_uuid FROM refs;
        
      \`\`\`
- ### **第二步：获取有引用关系的 block 信息**`;

    const processor = unified().use(remarkParse);
    const tree = processor.parse(input);
    const converted = convertToOutline(tree as MarkdownNode);

    expect(converted).toContain('- ### **第一步：获取引用集合**');
    expect(converted).toContain('```sql');
    expect(converted).toContain('SELECT DISTINCT target_uuid FROM refs');
    expect(converted).toContain('- ### **第二步：获取有引用关系的 block 信息**');
  });
});
