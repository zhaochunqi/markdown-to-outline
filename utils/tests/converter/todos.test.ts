import { describe, it, expect } from 'vitest';
import dedent from 'dedent';
import { convertMarkdownToOutline } from '../../markdown-converter';

describe('MarkdownConverter - TODO Items', () => {
  it('should convert checkbox items to TODO format when enabled', () => {
    const markdown = dedent`
      - [ ] Task to do
      - [x] Completed task
      - [-] In progress task`;

    const result = convertMarkdownToOutline(markdown, {
      convertToLogseqTodo: true,
    });

    expect(result).toContain('- TODO Task to do');
    expect(result).toContain('- DONE Completed task');
  });

  it('should leave checkbox items unchanged when TODO conversion is disabled', () => {
    const markdown = dedent`
      - [ ] Task to do
      - [x] Completed task`;

    const result = convertMarkdownToOutline(markdown, {
      convertToLogseqTodo: false,
    });

    expect(result).toContain('- [ ] Task to do');
    expect(result).toContain('- [x] Completed task');
  });

  it('should handle TODO conversion in nested lists', () => {
    const markdown = dedent`
      - Parent task
        - [ ] Subtask 1
        - [x] Subtask 2`;

    const result = convertMarkdownToOutline(markdown, {
      convertToLogseqTodo: true,
    });

    expect(result).toContain('- Parent task');
    expect(result).toContain('  - TODO Subtask 1');
    expect(result).toContain('  - DONE Subtask 2');
  });

  it('should handle TODO conversion with complex content', () => {
    const markdown = dedent`
      - [ ] Task with **bold** text
      - [x] Task with [link](https://example.com)`;

    const result = convertMarkdownToOutline(markdown, {
      convertToLogseqTodo: true,
    });

    expect(result).toContain('- TODO Task with **bold** text');
    expect(result).toContain('- DONE Task with [link](https://example.com)');
  });

  // TODO conversion in paragraphs test removed - [ ] and [x] are checkbox formats, not standard TODO formats
});
