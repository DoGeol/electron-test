// @vitest-environment node

import { mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createArticleSaveService } from './save-service';

describe('createArticleSaveService', () => {
  it('creates article bundle files only when save is called', async () => {
    const outputRoot = mkdtempSync(join(tmpdir(), 'bwa-save-'));
    const service = createArticleSaveService();

    const result = await service.saveArticle({
      outputPath: outputRoot,
      markdown: '# 제주 2박 3일\n\n봄 여행 동선을 정리했습니다.\n\n***\n\n둘째 블록입니다.',
      metadata: {
        topic: '제주 2박 3일',
      },
    });

    expect(result.ok).toBe(true);
    expect(statSync(result.path).isDirectory()).toBe(true);

    const files = readdirSync(result.path).sort();
    expect(files).toEqual(['article.json', 'article.md', 'metadata.json', 'naver.html']);

    const markdown = readFileSync(join(result.path, 'article.md'), 'utf8');
    expect(markdown).toContain('# 제주 2박 3일');
    expect(markdown).toContain('\n\n---\n\n둘째 블록입니다.');

    const metadata = JSON.parse(readFileSync(join(result.path, 'metadata.json'), 'utf8')) as Record<string, unknown>;
    expect(metadata.topic).toBe('제주 2박 3일');
  });

  it('copies source image into bundle when imagePath is provided', async () => {
    const outputRoot = mkdtempSync(join(tmpdir(), 'bwa-save-image-'));
    const inputDir = mkdtempSync(join(tmpdir(), 'bwa-input-image-'));
    const imagePath = join(inputDir, 'cover.png');
    writeFileSync(imagePath, Buffer.from('image-bytes'));

    const service = createArticleSaveService();
    const result = await service.saveArticle({
      outputPath: outputRoot,
      markdown: '# 이미지 테스트\n\n본문',
      metadata: {
        topic: '이미지 테스트',
        imagePath,
      },
    });

    const files = readdirSync(result.path).sort();
    expect(files).toContain('input-image.png');
  });

  it('throws when outputPath is missing', async () => {
    const service = createArticleSaveService();

    await expect(
      service.saveArticle({
        outputPath: '',
        markdown: '# 제목',
        metadata: {},
      })
    ).rejects.toThrow('저장 경로가 설정되지 않았습니다.');
  });

  it('throws when markdown content is empty', async () => {
    const outputRoot = mkdtempSync(join(tmpdir(), 'bwa-save-empty-'));
    const service = createArticleSaveService();

    await expect(
      service.saveArticle({
        outputPath: outputRoot,
        markdown: '   ',
        metadata: {},
      })
    ).rejects.toThrow('저장할 본문이 비어 있습니다.');
  });
});
