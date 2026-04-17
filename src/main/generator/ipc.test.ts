// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import { IPC_CHANNELS } from '../../shared/ipc';
import { registerGeneratorIpcHandlers } from './ipc';

describe('registerGeneratorIpcHandlers', () => {
  it('registers generator channel and injects settings values', async () => {
    const handlers = new Map<string, (...args: unknown[]) => unknown>();
    const ipcMain = {
      handle: vi.fn((channel: string, handler: (...args: unknown[]) => unknown) => {
        handlers.set(channel, handler);
      }),
    };

    const settingsService = {
      getGenerationSettings: vi.fn(() => ({
        apiKey: 'AIza-main-key',
        promptMarkdown: '## 저장된 프롬프트',
      })),
    };

    const generatorService = {
      generateArticle: vi.fn(async () => ({
        markdown: '# 생성 결과',
        grounding: {
          webSearchQueries: ['제주 여행'],
          sources: [{ title: '출처', uri: 'https://example.com' }],
        },
      })),
    };

    registerGeneratorIpcHandlers({
      ipcMain,
      settingsService,
      generatorService,
    });

    expect(handlers.has(IPC_CHANNELS.generatorGenerate)).toBe(true);

    const result = await handlers.get(IPC_CHANNELS.generatorGenerate)?.({}, { topic: '제주 여행', imagePath: '/tmp/cover.png' });

    expect(generatorService.generateArticle).toHaveBeenCalledWith({
      apiKey: 'AIza-main-key',
      topic: '제주 여행',
      promptMarkdown: '## 저장된 프롬프트',
      imagePath: '/tmp/cover.png',
    });
    expect(result).toEqual({
      markdown: '# 생성 결과',
      grounding: {
        webSearchQueries: ['제주 여행'],
        sources: [{ title: '출처', uri: 'https://example.com' }],
      },
    });
  });

  it('ignores invalid imagePath payload type', async () => {
    const handlers = new Map<string, (...args: unknown[]) => unknown>();
    const ipcMain = {
      handle: vi.fn((channel: string, handler: (...args: unknown[]) => unknown) => {
        handlers.set(channel, handler);
      }),
    };

    const settingsService = {
      getGenerationSettings: vi.fn(() => ({
        apiKey: 'AIza-main-key',
        promptMarkdown: '## 저장된 프롬프트',
      })),
    };

    const generatorService = {
      generateArticle: vi.fn(async () => ({
        markdown: '# 생성 결과',
      })),
    };

    registerGeneratorIpcHandlers({
      ipcMain,
      settingsService,
      generatorService,
    });

    await handlers.get(IPC_CHANNELS.generatorGenerate)?.({}, { topic: '서울 데이트 코스', imagePath: 1234 });

    expect(generatorService.generateArticle).toHaveBeenCalledWith({
      apiKey: 'AIza-main-key',
      topic: '서울 데이트 코스',
      promptMarkdown: '## 저장된 프롬프트',
      imagePath: undefined,
    });
  });
});
