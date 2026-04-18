export type ArticleSection = {
  id: string;
  markdown: string;
  order: number;
};

const DIVIDER_MARKDOWN = '---';
const DIVIDER_LINE_PATTERN = /^(?:-{3,}|\*{3,}|_{3,})$/;
const CODE_FENCE_PATTERN = /^\s*(```|~~~)/;
const MARKDOWN_IMAGE_LINE_PATTERN = /^!\[[^\]]*]\([^)]+\)\s*$/;

function normalizeSectionOrder(sections: ArticleSection[]): ArticleSection[] {
  return sections.map((section, index) => ({
    ...section,
    order: index,
  }));
}

function nextSectionId(index: number): string {
  return `section-${index + 1}`;
}

function isDividerLine(line: string): boolean {
  return DIVIDER_LINE_PATTERN.test(line.trim());
}

function isCodeFenceLine(line: string): boolean {
  return CODE_FENCE_PATTERN.test(line);
}

function isMarkdownImageLine(line: string): boolean {
  return MARKDOWN_IMAGE_LINE_PATTERN.test(line.trim());
}

function isPhotoPlaceholderLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) {
    return false;
  }

  const withoutEmphasis = trimmed.replace(/^([*_]{1,3})\s*/, '').replace(/\s*([*_]{1,3})$/, '').trim();
  return /^\(?\s*사진(?:\s|[0-9０-９]|[)）]|$)[^)）]*\s*\)?$/.test(withoutEmphasis);
}

function normalizeMarkdownLines(markdown: string): string[] {
  return markdown.replace(/\r\n/g, '\n').split('\n');
}

function trimSectionMarkdown(lines: string[]): string {
  return lines
    .join('\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

function collapseExcessBlankLines(markdown: string): string {
  return markdown.replace(/\n{3,}/g, '\n\n').trim();
}

export function splitMarkdownIntoSections(markdown: string): ArticleSection[] {
  const lines = normalizeMarkdownLines(markdown);
  const sections: ArticleSection[] = [];
  let currentLines: string[] = [];
  let inCodeFence = false;

  const flushSection = () => {
    const sectionMarkdown = trimSectionMarkdown(currentLines);
    currentLines = [];

    if (!sectionMarkdown) {
      return;
    }

    sections.push({
      id: nextSectionId(sections.length),
      markdown: sectionMarkdown,
      order: sections.length,
    });
  };

  for (const line of lines) {
    if (isCodeFenceLine(line)) {
      inCodeFence = !inCodeFence;
      currentLines.push(line);
      continue;
    }

    if (!inCodeFence && isDividerLine(line)) {
      flushSection();
      continue;
    }

    currentLines.push(line);
  }

  flushSection();

  return sections;
}

export function articleSectionsToMarkdown(sections: ArticleSection[]): string {
  return [...sections]
    .sort((a, b) => a.order - b.order)
    .map((section) => section.markdown.trim())
    .filter(Boolean)
    .join(`\n\n${DIVIDER_MARKDOWN}\n\n`);
}

export function normalizeMarkdownDividers(markdown: string): string {
  return articleSectionsToMarkdown(splitMarkdownIntoSections(markdown));
}

export function moveSectionUp(sections: ArticleSection[], sectionId: string): ArticleSection[] {
  const currentIndex = sections.findIndex((section) => section.id === sectionId);
  if (currentIndex <= 0) {
    return sections;
  }

  const nextSections = sections.map((section) => ({ ...section }));
  [nextSections[currentIndex - 1], nextSections[currentIndex]] = [nextSections[currentIndex], nextSections[currentIndex - 1]];
  return normalizeSectionOrder(nextSections);
}

export function moveSectionDown(sections: ArticleSection[], sectionId: string): ArticleSection[] {
  const currentIndex = sections.findIndex((section) => section.id === sectionId);
  if (currentIndex < 0 || currentIndex >= sections.length - 1) {
    return sections;
  }

  const nextSections = sections.map((section) => ({ ...section }));
  [nextSections[currentIndex], nextSections[currentIndex + 1]] = [nextSections[currentIndex + 1], nextSections[currentIndex]];
  return normalizeSectionOrder(nextSections);
}

export function moveSectionToIndex(sections: ArticleSection[], sectionId: string, targetIndex: number): ArticleSection[] {
  const currentIndex = sections.findIndex((section) => section.id === sectionId);
  if (currentIndex < 0 || sections.length === 0) {
    return sections;
  }

  const clampedTargetIndex = Math.max(0, Math.min(sections.length - 1, targetIndex));
  if (currentIndex === clampedTargetIndex) {
    return sections;
  }

  const nextSections = sections.map((section) => ({ ...section }));
  const [movedSection] = nextSections.splice(currentIndex, 1);
  nextSections.splice(clampedTargetIndex, 0, movedSection);
  return normalizeSectionOrder(nextSections);
}

export function deleteSections(sections: ArticleSection[], sectionIds: string[]): ArticleSection[] {
  if (sectionIds.length === 0) {
    return sections;
  }

  const deletedSectionIds = new Set(sectionIds);
  return normalizeSectionOrder(sections.filter((section) => !deletedSectionIds.has(section.id)).map((section) => ({ ...section })));
}

export function updateSectionMarkdown(sections: ArticleSection[], sectionId: string, markdown: string): ArticleSection[] {
  const normalizedMarkdown = markdown.trim();
  if (!normalizedMarkdown) {
    return sections.filter((section) => section.id !== sectionId).map((section, index) => ({ ...section, order: index }));
  }

  const splitSections = splitMarkdownIntoSections(normalizedMarkdown);
  const currentIndex = sections.findIndex((section) => section.id === sectionId);
  if (currentIndex < 0) {
    return sections;
  }

  const replacementSections =
    splitSections.length > 0
      ? splitSections.map((section, index) => ({
          ...section,
          id: splitSections.length === 1 ? sectionId : `${sectionId}-${index + 1}`,
        }))
      : [{ id: sectionId, markdown: normalizedMarkdown, order: 0 }];

  return normalizeSectionOrder([...sections.slice(0, currentIndex), ...replacementSections, ...sections.slice(currentIndex + 1)]);
}

export function replaceSectionMarkdown(sections: ArticleSection[], sectionId: string, markdown: string): ArticleSection[] {
  const normalizedMarkdown = markdown.trim();
  return sections.map((section) => (section.id === sectionId ? { ...section, markdown: normalizedMarkdown } : section));
}

export function stripPhotoPlaceholdersForCopy(markdown: string): string {
  const lines = normalizeMarkdownLines(markdown);
  const filteredLines: string[] = [];
  let inCodeFence = false;

  for (const line of lines) {
    if (isCodeFenceLine(line)) {
      inCodeFence = !inCodeFence;
      filteredLines.push(line);
      continue;
    }

    if (!inCodeFence && (isMarkdownImageLine(line) || isPhotoPlaceholderLine(line))) {
      continue;
    }

    filteredLines.push(line);
  }

  return collapseExcessBlankLines(trimSectionMarkdown(filteredLines));
}

export function prepareMarkdownForCopy(markdown: string): string {
  return normalizeMarkdownDividers(stripPhotoPlaceholdersForCopy(markdown));
}
