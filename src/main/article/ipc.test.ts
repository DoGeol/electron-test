// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import { IPC_CHANNELS } from '../../shared/ipc';
import { registerArticleIpcHandlers } from './ipc';

describe('registerArticleIpcHandlers', () => {
  it('registers article save channel and saves bundle with output path from settings', async () => {
    const handlers = new Map<string, (...args: unknown[]) => unknown>();
    const ipcMain = {
      handle: vi.fn((channel: string, handler: (...args: unknown[]) => unknown) => {
        handlers.set(channel, handler);
      }),
    };

    const settingsService = {
      getSettings: vi.fn(() => ({
        apiKeyMasked: 'AIza****',
        promptMarkdown: '## prompt',
        outputPath: '/tmp/article-output',
      })),
    };

    const articleSaveService = {
      saveArticle: vi.fn(async () => ({
        ok: true,
        path: '/tmp/article-output/2026-04-17-sample',
      })),
    };

    registerArticleIpcHandlers({
      ipcMain,
      settingsService,
      articleSaveService,
    });

    expect(handlers.has(IPC_CHANNELS.articleSave)).toBe(true);

    const result = await handlers
      .get(IPC_CHANNELS.articleSave)
      ?.({}, { markdown: '# 제목', metadata: { topic: '제목', imagePath: '/tmp/cover.png' } });

    expect(articleSaveService.saveArticle).toHaveBeenCalledWith({
      outputPath: '/tmp/article-output',
      markdown: '# 제목',
      metadata: { topic: '제목', imagePath: '/tmp/cover.png' },
    });
    expect(result).toEqual({
      ok: true,
      path: '/tmp/article-output/2026-04-17-sample',
    });
  });

  it('throws when settings output path is empty', async () => {
    const handlers = new Map<string, (...args: unknown[]) => unknown>();
    const ipcMain = {
      handle: vi.fn((channel: string, handler: (...args: unknown[]) => unknown) => {
        handlers.set(channel, handler);
      }),
    };

    registerArticleIpcHandlers({
      ipcMain,
      settingsService: {
        getSettings: () => ({
          apiKeyMasked: '',
          promptMarkdown: '',
          outputPath: '',
        }),
      },
      articleSaveService: {
        saveArticle: vi.fn(async () => ({ ok: true, path: '' })),
      },
    });

    await expect(handlers.get(IPC_CHANNELS.articleSave)?.({}, { markdown: '# 제목', metadata: {} })).rejects.toThrow(
      '저장 경로가 설정되지 않았습니다.'
    );
  });
});
