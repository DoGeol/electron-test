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
    expect(api).toHaveProperty('generator.generate');
    expect(api).toHaveProperty('article.save');
    expect(api).toHaveProperty('clipboard.copyNaver');
    expect(api).toHaveProperty('clipboard.copyMarkdown');
    expect(api).toHaveProperty('clipboard.copySelectionNaver');
  });

  it('routes to expected IPC channel for settings.get', async () => {
    const invoke = vi.fn(async () => ({ apiKeyMasked: '', promptMarkdown: '', outputPath: '' }));
    const api = createBridgeApi({ invoke });

    await api.settings.get();

    expect(invoke).toHaveBeenCalledWith(IPC_CHANNELS.settingsGet);
  });
});
