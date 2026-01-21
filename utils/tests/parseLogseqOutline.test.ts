import { describe, it, expect } from 'vitest';
import { parseLogseqOutline } from '../parseLogseqOutline';

describe('parseLogseqOutline', () => {
    it('should return empty array for empty input', () => {
        expect(parseLogseqOutline('')).toEqual([]);
        expect(parseLogseqOutline('   ')).toEqual([]);
    });

    it('should parse simple flat list', () => {
        const input = `- Item 1\n- Item 2\n- Item 3`;
        const result = parseLogseqOutline(input);

        expect(result).toHaveLength(3);
        expect(result[0].content).toBe('Item 1');
        expect(result[0].level).toBe(0);
        expect(result[1].content).toBe('Item 2');
        expect(result[2].content).toBe('Item 3');
    });

    it('should parse nested list', () => {
        const input = `- Parent\n  - Child 1\n    - Grandchild 1\n  - Child 2`;
        const result = parseLogseqOutline(input);

        expect(result).toHaveLength(1);
        const parent = result[0];
        expect(parent.content).toBe('Parent');
        expect(parent.children).toHaveLength(2);

        const child1 = parent.children[0];
        expect(child1.content).toBe('Child 1');
        expect(child1.level).toBe(1);
        expect(child1.children).toHaveLength(1);

        const grandchild = child1.children[0];
        expect(grandchild.content).toBe('Grandchild 1');
        expect(grandchild.level).toBe(2);

        const child2 = parent.children[1];
        expect(child2.content).toBe('Child 2');
        expect(child2.children).toHaveLength(0);
    });

    it('should parse TODO items', () => {
        const input = `- TODO Buy milk\n- DONE Drink milk`;
        const result = parseLogseqOutline(input, { convertTodoItems: true });

        expect(result[0].type).toBe('todo');
        expect(result[0].content).toBe('Buy milk');

        expect(result[1].type).toBe('done');
        expect(result[1].content).toBe('Drink milk');
    });

    it('should parse Headings', () => {
        const input = `- # Heading 1\n- ## Heading 2`;
        const result = parseLogseqOutline(input);

        expect(result[0].type).toBe('heading');
        expect(result[0].content).toBe('# Heading 1'); // parser keeps raw content for now based on implementation

        expect(result[1].type).toBe('heading');
    });

    it('should handle indentation gracefully', () => {
        // 2 spaces per level
        const input = `- Level 0\n  - Level 1\n    - Level 2`;
        const result = parseLogseqOutline(input);

        expect(result[0].level).toBe(0);
        expect(result[0].children[0].level).toBe(1);
        expect(result[0].children[0].children[0].level).toBe(2);
    });
});
