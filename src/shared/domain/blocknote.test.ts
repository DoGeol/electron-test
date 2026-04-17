// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import type { ArticleDocument } from './article';
import { articleDocumentToBlockNoteBlocks, blockNoteBlocksToMarkdown } from './blocknote';

const createDocument = (): ArticleDocument => ({
  id: 'doc-1',
  title: '제목',
  topic: '제목',
  createdAt: '2026-04-17T00:00:00.000Z',
  updatedAt: '2026-04-17T00:00:00.000Z',
  model: 'gemini-2.5-flash',
  promptVersion: 'v1',
  tags: ['travel'],
  blocks: [
    { id: 'h1', type: 'heading', content: { level: 1, text: '제목' }, order: 0 },
    { id: 'p1', type: 'paragraph', content: { text: '본문 문단' }, order: 1 },
    { id: 'l1', type: 'list', content: { items: ['하나', '둘'] }, order: 2 },
    { id: 'q1', type: 'quote', content: { text: '인용' }, order: 3 },
    { id: 'c1', type: 'code', content: { language: 'ts', code: 'const x = 1;' }, order: 4 },
    { id: 'i1', type: 'image', content: { alt: '샘플', url: 'https://example.com/image.png' }, order: 5 },
  ],
});

describe('blocknote domain bridge', () => {
  it('converts ArticleDocument into BlockNote-compatible blocks', () => {
    const blocks = articleDocumentToBlockNoteBlocks(createDocument());

    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks[0]?.type).toBe('heading');
  });

  it('exports BlockNote blocks back to Markdown canonical text', () => {
    const blocks = articleDocumentToBlockNoteBlocks(createDocument());
    const markdown = blockNoteBlocksToMarkdown(blocks);

    expect(markdown).toContain('# 제목');
    expect(markdown).toContain('본문 문단');
    expect(markdown).toContain('```ts');
    expect(markdown).toContain('![샘플](https://example.com/image.png)');
  });
});
