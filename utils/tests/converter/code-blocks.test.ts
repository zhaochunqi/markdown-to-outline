import { describe, it, expect } from 'vitest';
import dedent from 'dedent';
import { convertMarkdownToOutline } from '../../markdownConverter';

describe('MarkdownConverter - Code Blocks', () => {
  it('should handle code blocks with language specification', () => {
    const markdown = dedent`
      Here's some code:

      \`\`\`javascript
      const x = 1;
      console.log(x);
      \`\`\``;

    const result = convertMarkdownToOutline(markdown);
    expect(result).toContain("- Here's some code:");
    expect(result).toContain('```javascript');
    expect(result).toContain('const x = 1;');
    expect(result).toContain('console.log(x);');
  });

  it('should handle code blocks without language', () => {
    const markdown = dedent`
      Some code:

      \`\`\`
      echo "Hello World"
      \`\`\``;

    const result = convertMarkdownToOutline(markdown);
    expect(result).toContain('```');
    expect(result).toContain('echo "Hello World"');
  });

  it('should handle empty code blocks', () => {
    const markdown = dedent`
      Empty code block:

      \`\`\`typescript
      \`\`\``;

    const result = convertMarkdownToOutline(markdown);
    expect(result).toContain('```typescript');
  });

  it('should handle inline code', () => {
    const markdown = 'This has `inline code` in the middle.';

    const result = convertMarkdownToOutline(markdown);
    expect(result).toBe('- This has `inline code` in the middle.');
  });

  it('should handle code blocks in lists', () => {
    const markdown = dedent`
      - Item with code:
        \`\`\`python
        def hello():
          print("Hello")
        \`\`\`
      - Regular item`;

    const result = convertMarkdownToOutline(markdown);
    expect(result).toContain('- Item with code:');
    expect(result).toContain('```python');
    expect(result).toContain('def hello():');
    expect(result).toContain('print("Hello")');
    expect(result).toContain('- Regular item');
  });
});
