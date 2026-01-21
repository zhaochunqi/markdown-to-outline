import { describe, it, expect } from 'vitest';
import { convertToOutline, MarkdownNode } from '../convertToOutline';

describe('convertToOutline', () => {
    it('should convert simple paragraph root', () => {
        const root: MarkdownNode = {
            type: 'root',
            children: [
                {
                    type: 'paragraph',
                    children: [
                        { type: 'text', value: 'Hello World' }
                    ]
                }
            ]
        };

        // Default indentation for depth 0 is "- " at root? No, `getIndent(0)` is empty string.
        // Line 115: `${getIndent(depth)}- ${trimmedContent}`
        // If depth is 0, indent is "", so result is "- Hello World"
        const result = convertToOutline(root);
        expect(result).toBe('- Hello World');
    });

    it('should convert headings', () => {
        const root: MarkdownNode = {
            type: 'root',
            children: [
                {
                    type: 'heading',
                    depth: 1,
                    children: [{ type: 'text', value: 'Title' }]
                },
                {
                    type: 'heading',
                    depth: 2,
                    children: [{ type: 'text', value: 'Subtitle' }]
                }
            ]
        };

        // Heading default: keeps markers. - # Title
        const result = convertToOutline(root);
        expect(result).toContain('- # Title');
        expect(result).toContain('- ## Subtitle');
    });

    it('should convert lists', () => {
        const root: MarkdownNode = {
            type: 'root',
            children: [
                {
                    type: 'list',
                    children: [
                        {
                            type: 'listItem',
                            children: [
                                {
                                    type: 'paragraph',
                                    children: [{ type: 'text', value: 'Item 1' }]
                                }
                            ]
                        },
                        {
                            type: 'listItem',
                            children: [
                                {
                                    type: 'paragraph',
                                    children: [{ type: 'text', value: 'Item 2' }]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const result = convertToOutline(root);
        // Lists are usually indented if they follow a heading, but here they are at root.
        // logic: list -> children map -> listItem -> paragraph -> "- Item 1"
        // convertToOutline called recursively.
        expect(result).toContain('- Item 1');
        expect(result).toContain('- Item 2');
    });

    it('should handle Logseq TODO conversion if enabled', () => {
        const root: MarkdownNode = {
            type: 'root',
            children: [
                {
                    type: 'list',
                    children: [
                        {
                            type: 'listItem',
                            children: [{
                                type: 'paragraph',
                                children: [{ type: 'text', value: '[ ] Task' }]
                            }]
                        }
                    ]
                }
            ]
        };

        // The parser logic for listItem checks for `[ ]` at start of content
        const result = convertToOutline(root, 0, {
            removeHeaderMarkers: false,
            ignoreYamlFrontmatter: true,
            convertToLogseqTodo: true
        });

        expect(result).toContain('- TODO Task');
    });

    it('should handle complex text formatting', () => {
        const root: MarkdownNode = {
            type: 'root',
            children: [
                {
                    type: 'paragraph',
                    children: [
                        { type: 'text', value: 'Normal ' },
                        { type: 'emphasis', children: [{ type: 'text', value: 'Italic' }] },
                        { type: 'text', value: ' ' },
                        { type: 'strong', children: [{ type: 'text', value: 'Bold' }] },
                        { type: 'text', value: ' ' },
                        { type: 'inlineCode', value: 'Code' },
                        { type: 'text', value: ' ' },
                        { type: 'link', url: 'https://example.com', children: [{ type: 'text', value: 'Link' }] }
                    ]
                }
            ]
        };

        const result = convertToOutline(root);
        expect(result).toBe('- Normal *Italic* **Bold** `Code` [Link](https://example.com)');
    });

    it('should handle options: removeHeaderMarkers', () => {
        const root: MarkdownNode = {
            type: 'root',
            children: [
                {
                    type: 'heading',
                    depth: 1,
                    children: [{ type: 'text', value: 'Title' }]
                }
            ]
        };

        // Default: - # Title
        // With option: - Title
        const result = convertToOutline(root, 0, {
            removeHeaderMarkers: true,
            ignoreYamlFrontmatter: true,
            convertToLogseqTodo: false
        });

        expect(result).toBe('- Title');
    });

    it('should handle options: ignoreYamlFrontmatter', () => {
        const root: MarkdownNode = {
            type: 'root',
            children: [
                { type: 'yaml', value: 'key: value' } as any,
                { type: 'paragraph', children: [{ type: 'text', value: 'Content' }] }
            ]
        };

        // ignore = true (default)
        const resultIgnored = convertToOutline(root, 0, {
            removeHeaderMarkers: false,
            ignoreYamlFrontmatter: true,
            convertToLogseqTodo: false
        });
        expect(resultIgnored).toBe('- Content');

        // ignore = false
        const resultIncluded = convertToOutline(root, 0, {
            removeHeaderMarkers: false,
            ignoreYamlFrontmatter: false,
            convertToLogseqTodo: false
        });
        expect(resultIncluded).toBe('- key: value\n- Content');
    });

    it('should throw error for invalid nodes', () => {
        expect(() => convertToOutline(null as any)).toThrow();
        expect(() => convertToOutline({ type: 'root' } as any)).toThrow('Invalid root node');
        expect(() => convertToOutline({ type: 'heading', children: [] } as any)).toThrow('Invalid heading node');
    });

    it('should handle code blocks', () => {
        // Empty code block
        const emptyCode: MarkdownNode = {
            type: 'root',
            children: [{ type: 'code', lang: 'js', value: '' }]
        };
        const resultEmpty = convertToOutline(emptyCode);
        expect(resultEmpty).toContain('```js');

        // Code block with content
        const codeWithContent: MarkdownNode = {
            type: 'root',
            children: [{ type: 'code', lang: 'ts', value: 'const x = 1;\nconsole.log(x);' }]
        };
        const result = convertToOutline(codeWithContent);
        expect(result).toContain('```ts');
        expect(result).toContain('const x = 1;');
        expect(result).toContain('console.log(x);');
    });

    it('should handle blockquotes', () => {
        const root: MarkdownNode = {
            type: 'root',
            children: [
                {
                    type: 'blockquote',
                    children: [
                        {
                            type: 'paragraph',
                            children: [{ type: 'text', value: 'Quote line 1' }]
                        },
                        {
                            type: 'paragraph',
                            children: [{ type: 'text', value: 'Quote line 2' }]
                        }
                    ]
                }
            ]
        };

        const result = convertToOutline(root);
        // Expect:
        // - > Quote line 1
        // > Quote line 2 (indented?)
        // The implementation:
        // const firstLine = `${getIndent(depth)}- > ${quoteContent[0]}`;
        // const restLines = quoteContent.slice(1).map(line => `${getIndent(depth + 1)}> ${line}`);

        expect(result).toContain('- > Quote line 1');
        expect(result).toContain('> Quote line 2');
    });
});
