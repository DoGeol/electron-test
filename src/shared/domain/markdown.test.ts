// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { articleDocumentToMarkdown, markdownToArticleDocument } from './markdown';

const normalizeMarkdown = (value: string): string =>
  value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();

describe('markdown canonical conversion', () => {
  it('parses supported MVP block types from markdown input', () => {
    const source = [
      '# 제목',
      '',
      '문단 본문입니다.',
      '',
      '- 항목 하나',
      '- 항목 둘',
      '',
      '> 인용 문장',
      '',
      '```ts',
      'const value = 1;',
      '```',
      '',
      '![참고 이미지](https://example.com/image.png)',
    ].join('\n');

    const document = markdownToArticleDocument(source);
    expect(document.blocks.map((block) => block.type)).toEqual(['heading', 'paragraph', 'list', 'quote', 'code', 'image']);
  });

  it('keeps canonical output stable across parse/export round-trip', () => {
    const source = [
      '# 제목',
      '',
      '문단 본문입니다.',
      '',
      '- 항목 하나',
      '- 항목 둘',
      '',
      '> 인용 문장',
      '',
      '```ts',
      'const value = 1;',
      '```',
      '',
      '![참고 이미지](https://example.com/image.png)',
    ].join('\n');

    const firstDocument = markdownToArticleDocument(source);
    const firstCanonical = articleDocumentToMarkdown(firstDocument);

    const secondDocument = markdownToArticleDocument(firstCanonical);
    const secondCanonical = articleDocumentToMarkdown(secondDocument);

    expect(normalizeMarkdown(secondCanonical)).toBe(normalizeMarkdown(firstCanonical));
  });
});
