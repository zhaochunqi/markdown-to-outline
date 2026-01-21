import { describe, it, expect } from 'vitest';
import { convertLogseqToMarkdown, cleanupMarkdown } from '../convertLogseqToMarkdown';

describe('convertLogseqToMarkdown', () => {
    it('should return empty string for empty input', () => {
        expect(convertLogseqToMarkdown('')).toBe('');
    });

    it('should convert flat list to paragraphs', () => {
        // Note: implementation details might vary, usually top-level bullets are paragraphs if they don't have children or special flags
        // But looking at code: `convertBulletNode`: if level 0 -> processedContent (Paragraph)
        const input = `- Paragraph 1\n- Paragraph 2`;
        const result = convertLogseqToMarkdown(input);
        expect(result).toContain('Paragraph 1');
        expect(result).toContain('Paragraph 2');
        // Ensure they are separated by newlines
        expect(result).toMatch(/Paragraph 1\n\nParagraph 2/);
    });

    it('should convert nested list to Markdown list', () => {
        const input = `- Parent\n  - Child 1\n  - Child 2`;
        const result = convertLogseqToMarkdown(input);

        // Parent should be text (paragraph)
        expect(result).toContain('Parent');
        // Children should be list items
        expect(result).toContain('- Child 1');
        expect(result).toContain('- Child 2');
    });



    it('should cleanup markdown', () => {
        const input = `Paragraph\n\n\n\nNew Paragraph`;
        const result = cleanupMarkdown(input);
        expect(result).toBe(`Paragraph\n\nNew Paragraph`);
    });

    it('should convert TODO items to task list', () => {
        const input = `- TODO Task 1\n- DONE Task 2`;
        const result = convertLogseqToMarkdown(input, {
            convertTodoItems: true,
            useTaskListFormat: true
        });

        expect(result).toContain('- [ ] Task 1');
        expect(result).toContain('- [x] Task 2');
    });

    it('should convert TODO items to bold text if task list disabled', () => {
        const input = `- TODO Task 1`;
        const result = convertLogseqToMarkdown(input, {
            convertTodoItems: true,
            useTaskListFormat: false
        });

        expect(result).toContain('**TODO:** Task 1');
    });

    it('should convert headings', () => {
        // Input is Logseq format: - # Heading
        const input = `- # Heading 1\n- ## Heading 2`;
        const result = convertLogseqToMarkdown(input);

        expect(result).toContain('# Heading 1');
        expect(result).toContain('## Heading 2');
    });

    it('should convert nested structure to proper indentation', () => {
        const input = `- Root\n  - Level 1\n    - Level 2`;
        const result = convertLogseqToMarkdown(input);

        expect(result).toContain('Root');
        expect(result).toContain('- Level 1');
        expect(result).toContain('  - Level 2');
    });
});
