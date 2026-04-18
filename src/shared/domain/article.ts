export type ArticleBlockType = 'heading' | 'paragraph' | 'list' | 'quote' | 'code' | 'image' | 'divider';

export type GroundingSource = {
  title: string;
  uri: string;
};

export type GroundingMetadata = {
  webSearchQueries: string[];
  sources: GroundingSource[];
};

export type SourceImage = {
  fileName: string;
  localPath: string;
  mimeType: string;
};

export type ArticleBlock = {
  id: string;
  type: ArticleBlockType;
  content: unknown;
  order: number;
};

export type ArticleDocument = {
  id: string;
  title: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
  model: 'gemini-2.5-flash';
  promptVersion: string;
  blocks: ArticleBlock[];
  tags: string[];
  grounding?: GroundingMetadata;
  sourceImage?: SourceImage;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isArticleBlockType(value: unknown): value is ArticleBlockType {
  return value === 'heading' || value === 'paragraph' || value === 'list' || value === 'quote' || value === 'code' || value === 'image' || value === 'divider';
}

function isArticleBlock(value: unknown): value is ArticleBlock {
  if (!isRecord(value)) {
    return false;
  }

  const order = value.order;
  return (
    typeof value.id === 'string' &&
    isArticleBlockType(value.type) &&
    typeof order === 'number' &&
    Number.isInteger(order) &&
    order >= 0 &&
    'content' in value
  );
}

function isGroundingSource(value: unknown): value is GroundingSource {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.title === 'string' && typeof value.uri === 'string';
}

function isGroundingMetadata(value: unknown): value is GroundingMetadata {
  if (!isRecord(value)) {
    return false;
  }

  return Array.isArray(value.webSearchQueries) && value.webSearchQueries.every((query) => typeof query === 'string') && Array.isArray(value.sources) && value.sources.every((source) => isGroundingSource(source));
}

function isSourceImage(value: unknown): value is SourceImage {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.fileName === 'string' && typeof value.localPath === 'string' && typeof value.mimeType === 'string';
}

function assertArticleDocument(value: unknown): asserts value is ArticleDocument {
  if (!isRecord(value)) {
    throw new Error('Invalid article payload: not an object');
  }

  if (
    typeof value.id !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.topic !== 'string' ||
    typeof value.createdAt !== 'string' ||
    typeof value.updatedAt !== 'string' ||
    value.model !== 'gemini-2.5-flash' ||
    typeof value.promptVersion !== 'string' ||
    !Array.isArray(value.blocks) ||
    !Array.isArray(value.tags)
  ) {
    throw new Error('Invalid article payload: missing required fields');
  }

  if (!value.blocks.every((block) => isArticleBlock(block))) {
    throw new Error('Invalid article payload: invalid blocks');
  }

  if (!value.tags.every((tag) => typeof tag === 'string')) {
    throw new Error('Invalid article payload: invalid tags');
  }

  if (value.grounding !== undefined && !isGroundingMetadata(value.grounding)) {
    throw new Error('Invalid article payload: invalid grounding');
  }

  if (value.sourceImage !== undefined && !isSourceImage(value.sourceImage)) {
    throw new Error('Invalid article payload: invalid source image');
  }
}

export function serializeArticleDocument(document: ArticleDocument): string {
  return JSON.stringify(document, null, 2);
}

export function deserializeArticleDocument(serialized: string): ArticleDocument {
  let parsed: unknown;

  try {
    parsed = JSON.parse(serialized);
  } catch {
    throw new Error('Invalid article payload: cannot parse JSON');
  }

  assertArticleDocument(parsed);
  return parsed;
}

function normalizeOrder(blocks: ArticleBlock[]): ArticleBlock[] {
  return blocks.map((block, index) => ({ ...block, order: index }));
}

export function moveBlockUp(blocks: ArticleBlock[], blockId: string): ArticleBlock[] {
  const currentIndex = blocks.findIndex((block) => block.id === blockId);
  if (currentIndex <= 0) {
    return blocks;
  }

  const nextBlocks = blocks.map((block) => ({ ...block }));
  [nextBlocks[currentIndex - 1], nextBlocks[currentIndex]] = [nextBlocks[currentIndex], nextBlocks[currentIndex - 1]];
  return normalizeOrder(nextBlocks);
}

export function moveBlockDown(blocks: ArticleBlock[], blockId: string): ArticleBlock[] {
  const currentIndex = blocks.findIndex((block) => block.id === blockId);
  if (currentIndex < 0 || currentIndex >= blocks.length - 1) {
    return blocks;
  }

  const nextBlocks = blocks.map((block) => ({ ...block }));
  [nextBlocks[currentIndex], nextBlocks[currentIndex + 1]] = [nextBlocks[currentIndex + 1], nextBlocks[currentIndex]];
  return normalizeOrder(nextBlocks);
}

export function extractSelectedBlocks(blocks: ArticleBlock[], selectedIds: string[]): ArticleBlock[] {
  const selectedSet = new Set(selectedIds);
  return blocks.filter((block) => selectedSet.has(block.id));
}
