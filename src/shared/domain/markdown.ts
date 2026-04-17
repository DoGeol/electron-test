import type { ArticleBlock, ArticleDocument } from './article';

type HeadingContent = { level: number; text: string };
type ParagraphContent = { text: string };
type ListContent = { items: string[] };
type QuoteContent = { text: string };
type CodeContent = { language: string; code: string };
type ImageContent = { alt: string; url: string };

function isImageLine(line: string): boolean {
  return /^!\[.*\]\(.+\)$/.test(line.trim());
}

function isHeadingLine(line: string): boolean {
  return /^(#{1,6})\s+/.test(line.trim());
}

function isListLine(line: string): boolean {
  return line.trim().startsWith('- ');
}

function isQuoteLine(line: string): boolean {
  return line.trim().startsWith('> ');
}

function isCodeFence(line: string): boolean {
  return line.trim().startsWith('```');
}

function startsNewBlock(line: string): boolean {
  return isHeadingLine(line) || isImageLine(line) || isListLine(line) || isQuoteLine(line) || isCodeFence(line);
}

function nextBlockId(index: number): string {
  return `block-${index + 1}`;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function toHeadingContent(content: unknown): HeadingContent {
  const base = content as Partial<HeadingContent> | null;
  const level = typeof base?.level === 'number' ? Math.max(1, Math.min(6, Math.round(base.level))) : 1;
  const text = typeof base?.text === 'string' ? base.text : '';
  return { level, text };
}

function toParagraphContent(content: unknown): ParagraphContent {
  const base = content as Partial<ParagraphContent> | null;
  return { text: typeof base?.text === 'string' ? base.text : asString(content) };
}

function toListContent(content: unknown): ListContent {
  const base = content as Partial<ListContent> | null;
  if (Array.isArray(base?.items)) {
    return { items: base.items.map((item) => asString(item)).filter(Boolean) };
  }

  return { items: [] };
}

function toQuoteContent(content: unknown): QuoteContent {
  const base = content as Partial<QuoteContent> | null;
  return { text: typeof base?.text === 'string' ? base.text : asString(content) };
}

function toCodeContent(content: unknown): CodeContent {
  const base = content as Partial<CodeContent> | null;
  return {
    language: typeof base?.language === 'string' ? base.language : '',
    code: typeof base?.code === 'string' ? base.code : '',
  };
}

function toImageContent(content: unknown): ImageContent {
  const base = content as Partial<ImageContent> | null;
  return {
    alt: typeof base?.alt === 'string' ? base.alt : '',
    url: typeof base?.url === 'string' ? base.url : asString(content),
  };
}

function blockToMarkdown(block: ArticleBlock): string {
  switch (block.type) {
    case 'heading': {
      const { level, text } = toHeadingContent(block.content);
      return `${'#'.repeat(level)} ${text}`.trimEnd();
    }
    case 'paragraph': {
      const { text } = toParagraphContent(block.content);
      return text;
    }
    case 'list': {
      const { items } = toListContent(block.content);
      return items.map((item) => `- ${item}`).join('\n');
    }
    case 'quote': {
      const { text } = toQuoteContent(block.content);
      return text
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => `> ${line}`)
        .join('\n');
    }
    case 'code': {
      const { language, code } = toCodeContent(block.content);
      return `\`\`\`${language}\n${code}\n\`\`\``;
    }
    case 'image': {
      const { alt, url } = toImageContent(block.content);
      return `![${alt}](${url})`;
    }
    default:
      return '';
  }
}

export function articleDocumentToMarkdown(document: Pick<ArticleDocument, 'blocks'>): string {
  const sortedBlocks = [...document.blocks].sort((a, b) => a.order - b.order);
  const chunks = sortedBlocks.map(blockToMarkdown).filter((chunk) => chunk.length > 0);
  return chunks.join('\n\n');
}

export function markdownToArticleDocument(markdown: string): ArticleDocument {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const blocks: ArticleBlock[] = [];
  let cursor = 0;

  while (cursor < lines.length) {
    const rawLine = lines[cursor];
    const trimmedLine = rawLine.trim();

    if (trimmedLine.length === 0) {
      cursor += 1;
      continue;
    }

    if (isCodeFence(trimmedLine)) {
      const language = trimmedLine.slice(3).trim();
      cursor += 1;

      const codeLines: string[] = [];
      while (cursor < lines.length && !isCodeFence(lines[cursor])) {
        codeLines.push(lines[cursor]);
        cursor += 1;
      }

      if (cursor < lines.length && isCodeFence(lines[cursor])) {
        cursor += 1;
      }

      blocks.push({
        id: nextBlockId(blocks.length),
        type: 'code',
        content: { language, code: codeLines.join('\n') } satisfies CodeContent,
        order: blocks.length,
      });
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(trimmedLine);
    if (headingMatch) {
      blocks.push({
        id: nextBlockId(blocks.length),
        type: 'heading',
        content: { level: headingMatch[1].length, text: headingMatch[2] } satisfies HeadingContent,
        order: blocks.length,
      });
      cursor += 1;
      continue;
    }

    const imageMatch = /^!\[(.*)\]\((.+)\)$/.exec(trimmedLine);
    if (imageMatch) {
      blocks.push({
        id: nextBlockId(blocks.length),
        type: 'image',
        content: { alt: imageMatch[1], url: imageMatch[2] } satisfies ImageContent,
        order: blocks.length,
      });
      cursor += 1;
      continue;
    }

    if (isListLine(trimmedLine)) {
      const items: string[] = [];
      while (cursor < lines.length && isListLine(lines[cursor])) {
        items.push(lines[cursor].trim().slice(2).trim());
        cursor += 1;
      }

      blocks.push({
        id: nextBlockId(blocks.length),
        type: 'list',
        content: { items } satisfies ListContent,
        order: blocks.length,
      });
      continue;
    }

    if (isQuoteLine(trimmedLine)) {
      const quoteLines: string[] = [];
      while (cursor < lines.length && isQuoteLine(lines[cursor])) {
        quoteLines.push(lines[cursor].trim().slice(2));
        cursor += 1;
      }

      blocks.push({
        id: nextBlockId(blocks.length),
        type: 'quote',
        content: { text: quoteLines.join('\n') } satisfies QuoteContent,
        order: blocks.length,
      });
      continue;
    }

    const paragraphLines: string[] = [];
    while (cursor < lines.length) {
      const current = lines[cursor];
      const trimmed = current.trim();

      if (trimmed.length === 0 || startsNewBlock(trimmed)) {
        break;
      }

      paragraphLines.push(trimmed);
      cursor += 1;
    }

    blocks.push({
      id: nextBlockId(blocks.length),
      type: 'paragraph',
      content: { text: paragraphLines.join(' ') } satisfies ParagraphContent,
      order: blocks.length,
    });
  }

  const firstHeading = blocks.find((block) => block.type === 'heading');
  const title = firstHeading ? toHeadingContent(firstHeading.content).text : '';

  return {
    id: `doc-${Date.now()}`,
    title,
    topic: title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    model: 'gemini-2.5-flash',
    promptVersion: 'v1',
    blocks,
    tags: [],
  };
}
