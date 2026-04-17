// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  type ArticleBlock,
  type ArticleDocument,
  deserializeArticleDocument,
  extractSelectedBlocks,
  moveBlockDown,
  moveBlockUp,
  serializeArticleDocument,
} from './article';

const createDocument = (overrides: Partial<ArticleDocument> = {}): ArticleDocument => ({
  id: 'doc-1',
  title: '샘플 제목',
  topic: '샘플 주제',
  createdAt: '2026-04-17T00:00:00.000Z',
  updatedAt: '2026-04-17T00:00:00.000Z',
  model: 'gemini-2.5-flash',
  promptVersion: 'v1',
  blocks: [],
  tags: ['blog'],
  ...overrides,
});

const createBlocks = (): ArticleBlock[] => [
  { id: 'block-a', type: 'paragraph', content: { text: 'A' }, order: 0 },
  { id: 'block-b', type: 'paragraph', content: { text: 'B' }, order: 1 },
  { id: 'block-c', type: 'paragraph', content: { text: 'C' }, order: 2 },
];

describe('article domain', () => {
  it('serializes and deserializes ArticleDocument without data loss', () => {
    const input = createDocument({
      tags: ['travel', 'jeju'],
      blocks: [
        { id: 'h1', type: 'heading', content: { level: 1, text: '제목' }, order: 0 },
        { id: 'p1', type: 'paragraph', content: { text: '본문' }, order: 1 },
      ],
    });

    const serialized = serializeArticleDocument(input);
    expect(() => JSON.parse(serialized)).not.toThrow();

    const restored = deserializeArticleDocument(serialized);
    expect(restored).toEqual(input);
  });

  it('throws when deserializing malformed payload', () => {
    expect(() => deserializeArticleDocument('{"id":1}')).toThrow();
  });

  it('moves a middle block up and re-normalizes order', () => {
    const blocks = createBlocks();
    const moved = moveBlockUp(blocks, 'block-b');

    expect(moved.map((block) => block.id)).toEqual(['block-b', 'block-a', 'block-c']);
    expect(moved.map((block) => block.order)).toEqual([0, 1, 2]);
    expect(blocks.map((block) => block.id)).toEqual(['block-a', 'block-b', 'block-c']);
  });

  it('does not move when the first block is moved up', () => {
    const blocks = createBlocks();
    const moved = moveBlockUp(blocks, 'block-a');

    expect(moved).toEqual(blocks);
  });

  it('moves a middle block down and re-normalizes order', () => {
    const blocks = createBlocks();
    const moved = moveBlockDown(blocks, 'block-b');

    expect(moved.map((block) => block.id)).toEqual(['block-a', 'block-c', 'block-b']);
    expect(moved.map((block) => block.order)).toEqual([0, 1, 2]);
    expect(blocks.map((block) => block.id)).toEqual(['block-a', 'block-b', 'block-c']);
  });

  it('does not move when the last block is moved down', () => {
    const blocks = createBlocks();
    const moved = moveBlockDown(blocks, 'block-c');

    expect(moved).toEqual(blocks);
  });

  it('extracts selected blocks in document order and ignores unknown ids', () => {
    const blocks = createBlocks();
    const selected = extractSelectedBlocks(blocks, ['block-c', 'missing', 'block-a']);

    expect(selected.map((block) => block.id)).toEqual(['block-a', 'block-c']);
    expect(selected.map((block) => block.order)).toEqual([0, 2]);
  });
});
