import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { convert } from '@jjlabsio/md-to-naver-blog';
import { markdownToArticleDocument } from '../../shared/domain/markdown';
import { normalizeMarkdownDividers } from '../../shared/domain/section';
import type { ArticleSavePayload, ArticleSaveResult } from '../../shared/ipc';

type FileSystemLike = {
  copyFile: (source: string, destination: string) => Promise<void>;
  mkdir: (path: string, options: { recursive: true }) => Promise<string | void | undefined>;
  writeFile: (path: string, data: string, encoding: 'utf8') => Promise<void>;
};

type SaveMetadata = ArticleSavePayload['metadata'];

type SaveInput = {
  outputPath: string;
  markdown: string;
  metadata: SaveMetadata;
};

type SaveServiceDeps = {
  fileSystem?: FileSystemLike;
  now?: () => Date;
};

const IMAGE_MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

function slugify(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return normalized || 'article';
}

function formatDatePrefix(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function resolveImageExtension(imagePath: string): string | null {
  const extension = extname(imagePath).toLowerCase();
  return IMAGE_MIME_BY_EXT[extension] ? extension : null;
}

export function createArticleSaveService({
  fileSystem = {
    copyFile,
    mkdir,
    writeFile,
  },
  now = () => new Date(),
}: SaveServiceDeps = {}) {
  return {
    async saveArticle({ outputPath, markdown, metadata }: SaveInput): Promise<ArticleSaveResult> {
      const normalizedOutputPath = outputPath.trim();
      const normalizedMarkdown = normalizeMarkdownDividers(markdown.trim());

      if (!normalizedOutputPath) {
        throw new Error('저장 경로가 설정되지 않았습니다. 설정에서 저장 경로를 먼저 지정해주세요.');
      }

      if (!normalizedMarkdown) {
        throw new Error('저장할 본문이 비어 있습니다. 글을 생성하거나 편집한 뒤 다시 시도해주세요.');
      }

      const currentTime = now();
      const articleDocument = markdownToArticleDocument(normalizedMarkdown);
      const resolvedTopic = metadata.topic?.trim() || articleDocument.topic || articleDocument.title || 'untitled';

      articleDocument.topic = resolvedTopic;
      if (!articleDocument.title) {
        articleDocument.title = resolvedTopic;
      }
      articleDocument.updatedAt = currentTime.toISOString();

      if (metadata.grounding) {
        articleDocument.grounding = metadata.grounding;
      }

      const directoryName = `${formatDatePrefix(currentTime)}-${slugify(resolvedTopic)}`;
      const bundlePath = join(normalizedOutputPath, directoryName);
      await fileSystem.mkdir(bundlePath, { recursive: true });

      let copiedImageFileName: string | undefined;
      if (metadata.imagePath) {
        const extension = resolveImageExtension(metadata.imagePath);
        if (extension) {
          copiedImageFileName = `input-image${extension}`;
          await fileSystem.copyFile(metadata.imagePath, join(bundlePath, copiedImageFileName));
          articleDocument.sourceImage = {
            fileName: copiedImageFileName,
            localPath: join(bundlePath, copiedImageFileName),
            mimeType: IMAGE_MIME_BY_EXT[extension],
          };
        }
      }

      const naverResult = convert(normalizedMarkdown);

      await fileSystem.writeFile(join(bundlePath, 'article.md'), normalizedMarkdown, 'utf8');
      await fileSystem.writeFile(join(bundlePath, 'naver.html'), naverResult.html, 'utf8');
      await fileSystem.writeFile(join(bundlePath, 'article.json'), JSON.stringify(articleDocument, null, 2), 'utf8');
      await fileSystem.writeFile(
        join(bundlePath, 'metadata.json'),
        JSON.stringify(
          {
            savedAt: currentTime.toISOString(),
            model: articleDocument.model,
            topic: articleDocument.topic,
            title: articleDocument.title,
            promptVersion: articleDocument.promptVersion,
            grounding: articleDocument.grounding ?? null,
            sourceImage: articleDocument.sourceImage ?? null,
            copiedImageFileName: copiedImageFileName ?? null,
          },
          null,
          2
        ),
        'utf8'
      );

      return {
        ok: true,
        path: bundlePath,
      };
    },
  };
}
