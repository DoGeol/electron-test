// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import { IPC_CHANNELS } from '../../shared/ipc';
import { registerSettingsIpcHandlers } from './ipc';

describe('registerSettingsIpcHandlers', () => {
  it('registers settings channels and delegates to service', async () => {
    const handlers = new Map<string, (...args: unknown[]) => unknown>();
    const ipcMain = {
      handle: vi.fn((channel: string, handler: (...args: unknown[]) => unknown) => {
        handlers.set(channel, handler);
      }),
    };

    const settingsService = {
      getSettings: vi.fn(() => ({ apiKeyMasked: 'AIza****', promptMarkdown: '## prompt', outputPath: '/tmp/out' })),
      updateSettings: vi.fn(),
      testApiKey: vi.fn(async () => ({ ok: true, message: 'ok' })),
    };

    const dialog = {
      showOpenDialog: vi.fn(async () => ({ canceled: false, filePaths: ['/tmp/selected'] })),
    };

    registerSettingsIpcHandlers({
      ipcMain,
      settingsService,
      dialog,
    });

    expect(handlers.has(IPC_CHANNELS.settingsGet)).toBe(true);
    expect(handlers.has(IPC_CHANNELS.settingsUpdate)).toBe(true);
    expect(handlers.has(IPC_CHANNELS.settingsTestApiKey)).toBe(true);
    expect(handlers.has(IPC_CHANNELS.settingsSelectOutputPath)).toBe(true);

    const getResult = await handlers.get(IPC_CHANNELS.settingsGet)?.();
    expect(getResult).toEqual({ apiKeyMasked: 'AIza****', promptMarkdown: '## prompt', outputPath: '/tmp/out' });

    await handlers.get(IPC_CHANNELS.settingsUpdate)?.({}, { promptMarkdown: '## changed' });
    expect(settingsService.updateSettings).toHaveBeenCalledWith({ promptMarkdown: '## changed' });

    const testResult = await handlers.get(IPC_CHANNELS.settingsTestApiKey)?.({}, 'AIza-input');
    expect(testResult).toEqual({ ok: true, message: 'ok' });
    expect(settingsService.testApiKey).toHaveBeenCalledWith('AIza-input');

    const selectedPath = await handlers.get(IPC_CHANNELS.settingsSelectOutputPath)?.();
    expect(selectedPath).toBe('/tmp/selected');
    expect(settingsService.updateSettings).toHaveBeenCalledWith({ outputPath: '/tmp/selected' });
  });
});
