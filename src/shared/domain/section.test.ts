// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  articleSectionsToMarkdown,
  deleteSections,
  moveSectionDown,
  moveSectionToIndex,
  moveSectionUp,
  normalizeMarkdownDividers,
  prepareMarkdownForCopy,
  replaceSectionMarkdown,
  splitMarkdownIntoSections,
  stripPhotoPlaceholdersForCopy,
  updateSectionMarkdown,
} from './section';

describe('article section domain', () => {
  it('splits markdown into sections by divider lines', () => {
    const sections = splitMarkdownIntoSections(['# 제목', '', '도입 본문', '', '---', '', '## 둘째 블록', '', '본문'].join('\n'));

    expect(sections).toEqual([
      { id: 'section-1', markdown: '# 제목\n\n도입 본문', order: 0 },
      { id: 'section-2', markdown: '## 둘째 블록\n\n본문', order: 1 },
    ]);
  });

  it('accepts common markdown divider variants and exports canonical dividers', () => {
    const normalized = normalizeMarkdownDividers(['첫 블록', '', '***', '', '둘째 블록', '', '___', '', '셋째 블록'].join('\n'));

    expect(normalized).toBe(['첫 블록', '', '---', '', '둘째 블록', '', '---', '', '셋째 블록'].join('\n'));
  });

  it('does not split divider-like lines inside fenced code blocks', () => {
    const source = ['첫 블록', '', '```md', '---', '```', '', '---', '', '둘째 블록'].join('\n');
    const sections = splitMarkdownIntoSections(source);

    expect(sections.map((section) => section.markdown)).toEqual([['첫 블록', '', '```md', '---', '```'].join('\n'), '둘째 블록']);
  });

  it('joins sections with canonical markdown dividers', () => {
    const markdown = articleSectionsToMarkdown([
      { id: 'section-b', markdown: 'B', order: 1 },
      { id: 'section-a', markdown: 'A', order: 0 },
    ]);

    expect(markdown).toBe(['A', '', '---', '', 'B'].join('\n'));
  });

  it('moves sections without mutating the original array', () => {
    const sections = [
      { id: 'a', markdown: 'A', order: 0 },
      { id: 'b', markdown: 'B', order: 1 },
      { id: 'c', markdown: 'C', order: 2 },
    ];

    expect(moveSectionUp(sections, 'b').map((section) => section.id)).toEqual(['b', 'a', 'c']);
    expect(moveSectionDown(sections, 'b').map((section) => section.id)).toEqual(['a', 'c', 'b']);
    expect(sections.map((section) => section.id)).toEqual(['a', 'b', 'c']);
  });

  it('moves a section to a target index and reorders without mutation', () => {
    const sections = [
      { id: 'a', markdown: 'A', order: 0 },
      { id: 'b', markdown: 'B', order: 1 },
      { id: 'c', markdown: 'C', order: 2 },
    ];

    const moved = moveSectionToIndex(sections, 'a', 2);

    expect(moved.map((section) => section.id)).toEqual(['b', 'c', 'a']);
    expect(moved.map((section) => section.order)).toEqual([0, 1, 2]);
    expect(sections.map((section) => section.id)).toEqual(['a', 'b', 'c']);
  });

  it('deletes selected sections and reorders without mutation', () => {
    const sections = [
      { id: 'a', markdown: 'A', order: 0 },
      { id: 'b', markdown: 'B', order: 1 },
      { id: 'c', markdown: 'C', order: 2 },
    ];

    const deleted = deleteSections(sections, ['a', 'c']);

    expect(deleted).toEqual([{ id: 'b', markdown: 'B', order: 0 }]);
    expect(sections.map((section) => section.id)).toEqual(['a', 'b', 'c']);
  });

  it('updates a section and expands it when the edited markdown contains dividers', () => {
    const sections = [
      { id: 'section-1', markdown: 'A', order: 0 },
      { id: 'section-2', markdown: 'B', order: 1 },
    ];

    const updated = updateSectionMarkdown(sections, 'section-1', ['A-1', '', '---', '', 'A-2'].join('\n'));

    expect(updated).toEqual([
      { id: 'section-1-1', markdown: 'A-1', order: 0 },
      { id: 'section-1-2', markdown: 'A-2', order: 1 },
      { id: 'section-2', markdown: 'B', order: 2 },
    ]);
  });

  it('replaces a section without splitting draft divider text', () => {
    const sections = [
      { id: 'section-1', markdown: 'A', order: 0 },
      { id: 'section-2', markdown: 'B', order: 1 },
    ];

    const updated = replaceSectionMarkdown(sections, 'section-1', ['A-1', '', '---', '', 'A-2'].join('\n'));

    expect(updated).toEqual([
      { id: 'section-1', markdown: ['A-1', '', '---', '', 'A-2'].join('\n'), order: 0 },
      { id: 'section-2', markdown: 'B', order: 1 },
    ]);
  });

  it('strips standalone photo placeholders for copy only', () => {
    const source = ['# 제목', '', '*(사진 1)*', '', '이 문장은 사진 단어를 유지합니다.', '', '*사진 2*', '', '(사진 3)'].join('\n');

    expect(stripPhotoPlaceholdersForCopy(source)).toBe(['# 제목', '', '이 문장은 사진 단어를 유지합니다.'].join('\n'));
  });

  it('strips markdown image lines and normalizes empty sections for copy', () => {
    const source = ['첫 블록', '', '---', '', '![사진](https://example.com/a.png)', '', '---', '', '둘째 블록'].join('\n');

    expect(prepareMarkdownForCopy(source)).toBe(['첫 블록', '', '---', '', '둘째 블록'].join('\n'));
  });

  it('does not strip photo-like lines inside fenced code blocks', () => {
    const source = ['```md', '*(사진 1)*', '![사진](x.png)', '```'].join('\n');

    expect(stripPhotoPlaceholdersForCopy(source)).toBe(source);
  });
});
