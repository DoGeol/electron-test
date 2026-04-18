// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import { createBridgeApi } from './bridge';
import { IPC_CHANNELS } from '../shared/ipc';

describe('createBridgeApi', () => {
  it('exposes expected bridge namespaces', () => {
    const invoke = vi.fn(async () => ({}));
    const api = createBridgeApi({ invoke });

    expect(api).toHaveProperty('settings.get');
    expect(api).toHaveProperty('settings.update');
    expect(api).toHaveProperty('settings.testApiKey');
    expect(api).toHaveProperty('settings.chooseOutputPath');
    expect(api).toHaveProperty('generator.generate');
    expect(api).toHaveProperty('article.save');
    expect(api).toHaveProperty('clipboard.copyNaver');
    expect(api).toHaveProperty('clipboard.copyMarkdown');
    expect(api).toHaveProperty('clipboard.copySelectionNaver');
    expect(api).toHaveProperty('files.getPathForFile');
    expect(api).not.toHaveProperty('fs');
    expect(api).not.toHaveProperty('electronStore');
  });

  it('routes to expected IPC channel for settings.get', async () => {
    const invoke = vi.fn(async () => ({ apiKeyMasked: '', promptMarkdown: '', outputPath: '' }));
    const api = createBridgeApi({ invoke });

    await api.settings.get();

    expect(invoke).toHaveBeenCalledWith(IPC_CHANNELS.settingsGet);
  });

  it('routes to expected IPC channel for settings.chooseOutputPath', async () => {
    const invoke = vi.fn(async () => null);
    const api = createBridgeApi({ invoke });

    await api.settings.chooseOutputPath();

    expect(invoke).toHaveBeenCalledWith(IPC_CHANNELS.settingsChooseOutputPath);
  });

  it('resolves file paths through the provided Electron file resolver without IPC', () => {
    const invoke = vi.fn(async () => null);
    const file = new File(['image-bytes'], 'cover.png', { type: 'image/png' });
    const getPathForFile = vi.fn(() => '/tmp/cover.png');
    const api = createBridgeApi({ invoke }, { getPathForFile });

    expect(api.files.getPathForFile(file)).toBe('/tmp/cover.png');
    expect(getPathForFile).toHaveBeenCalledWith(file);
    expect(invoke).not.toHaveBeenCalled();
  });
});
