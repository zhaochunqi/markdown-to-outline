import { describe, it, expect } from 'vitest';
import { convertLogseqToMarkdown } from '../convertLogseqToMarkdown';
import { parseLogseqOutline } from '../parseLogseqOutline';

describe('Integration: Logseq to Markdown Pipeline', () => {
    it('should correctly parse and then convert a full document structure', () => {
        // This looks like a legitimate Logseq file content
        const input = [
            '- # Title',
            '  - Section 1',
            '    - Point A',
            '    - Point B',
            '  - Section 2',
            '    - TODO Task X'
        ].join('\n');

        // 1. Verify Parser intermediate state
        const nodes = parseLogseqOutline(input);
        expect(nodes).toHaveLength(1); // Title
        expect(nodes[0].children).toHaveLength(2); // Section 1, Section 2

        // 2. Verify Final Output
        const markdown = convertLogseqToMarkdown(input);

        expect(markdown).toContain('# Title');
        expect(markdown).toContain('Section 1');
        expect(markdown).toContain('- Point A');
        expect(markdown).toContain('- [ ] Task X');
    });
});
