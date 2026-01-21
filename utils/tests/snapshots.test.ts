import { describe, it, expect } from 'vitest';
import { convertLogseqToMarkdown } from '../convertLogseqToMarkdown';

describe('Snapshots', () => {
    it('should match snapshot for complex Logseq content', () => {
        const input = `
- # Project Alpha
  - TODO Define requirements
    - Meeting with stakeholders
    - Write draft
  - ## Development
    - [ ] Setup repo
    - [x] Initial commit
  - > Important note for developers
  - Code example:
    - \`\`\`typescript
      const a = 1;
      console.log(a);
      \`\`\`
`.trim();

        const output = convertLogseqToMarkdown(input, {
            convertTodoItems: true,
            useTaskListFormat: true
        });

        expect(output).toMatchSnapshot();
    });
});
