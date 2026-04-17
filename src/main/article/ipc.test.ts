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
      clipboardService: {
        copyNaver: vi.fn(async () => ({ ok: true })),
        copyMarkdown: vi.fn(async () => ({ ok: true })),
        copySelectionNaver: vi.fn(async () => ({ ok: true })),
      },
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

  it('registers clipboard channels and delegates markdown payload', async () => {
    const handlers = new Map<string, (...args: unknown[]) => unknown>();
    const ipcMain = {
      handle: vi.fn((channel: string, handler: (...args: unknown[]) => unknown) => {
        handlers.set(channel, handler);
      }),
    };

    const clipboardService = {
      copyNaver: vi.fn(async () => ({ ok: true })),
      copyMarkdown: vi.fn(async () => ({ ok: true })),
      copySelectionNaver: vi.fn(async () => ({ ok: true })),
    };

    registerArticleIpcHandlers({
      ipcMain,
      settingsService: {
        getSettings: () => ({
          apiKeyMasked: '',
          promptMarkdown: '',
          outputPath: '/tmp/article-output',
        }),
      },
      articleSaveService: {
        saveArticle: vi.fn(async () => ({ ok: true, path: '/tmp/article-output/sample' })),
      },
      clipboardService,
    });

    expect(handlers.has(IPC_CHANNELS.articleCopyNaver)).toBe(true);
    expect(handlers.has(IPC_CHANNELS.articleCopyMarkdown)).toBe(true);
    expect(handlers.has(IPC_CHANNELS.articleCopySelectionNaver)).toBe(true);

    await handlers.get(IPC_CHANNELS.articleCopyNaver)?.({}, '# 전체 글');
    await handlers.get(IPC_CHANNELS.articleCopyMarkdown)?.({}, '# 원문');
    await handlers.get(IPC_CHANNELS.articleCopySelectionNaver)?.({}, '## 선택 문단');

    expect(clipboardService.copyNaver).toHaveBeenCalledWith('# 전체 글');
    expect(clipboardService.copyMarkdown).toHaveBeenCalledWith('# 원문');
    expect(clipboardService.copySelectionNaver).toHaveBeenCalledWith('## 선택 문단');
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
      clipboardService: {
        copyNaver: vi.fn(async () => ({ ok: true })),
        copyMarkdown: vi.fn(async () => ({ ok: true })),
        copySelectionNaver: vi.fn(async () => ({ ok: true })),
      },
    });

    await expect(handlers.get(IPC_CHANNELS.articleSave)?.({}, { markdown: '# 제목', metadata: {} })).rejects.toThrow(
      '저장 경로가 설정되지 않았습니다.'
    );
  });
});
