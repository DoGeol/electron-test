import { BlockNoteEditor, type PartialBlock } from '@blocknote/core';
import type { ArticleDocument } from './article';
import { articleDocumentToMarkdown } from './markdown';

export function articleDocumentToBlockNoteBlocks(document: ArticleDocument): PartialBlock[] {
  const editor = BlockNoteEditor.create();
  const markdown = articleDocumentToMarkdown(document);
  return editor.tryParseMarkdownToBlocks(markdown) as PartialBlock[];
}

export function blockNoteBlocksToMarkdown(blocks: PartialBlock[]): string {
  const editor = BlockNoteEditor.create();
  return editor.blocksToMarkdownLossy(blocks).trim();
}
