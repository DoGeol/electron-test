// @vitest-environment node

import { mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_PROMPT_MARKDOWN, createSettingsService } from './settings-service';

type MemoryStore = {
  get: <T>(key: string) => T | undefined;
  set: (key: string, value: unknown) => void;
};

function createMemoryStore(initial: Record<string, unknown> = {}): MemoryStore {
  const state = new Map<string, unknown>(Object.entries(initial));
  return {
    get: <T>(key: string) => state.get(key) as T | undefined,
    set: (key: string, value: unknown) => {
      state.set(key, value);
    },
  };
}

describe('createSettingsService', () => {
  it('returns defaults when store is empty', () => {
    const service = createSettingsService({ store: createMemoryStore(), logger: { info: vi.fn(), error: vi.fn() } });
    const settings = service.getSettings();

    expect(settings).toEqual({
      apiKeyMasked: '',
      promptMarkdown: DEFAULT_PROMPT_MARKDOWN,
      outputPath: '',
    });
  });

  it('updates and persists settings with masked api key', () => {
    const service = createSettingsService({ store: createMemoryStore(), logger: { info: vi.fn(), error: vi.fn() } });

    service.updateSettings({
      apiKey: 'AIza-very-secret-key',
      promptMarkdown: '## 새 프롬프트',
      outputPath: '/tmp/output',
    });

    const settings = service.getSettings();
    expect(settings.apiKeyMasked).not.toContain('very-secret-key');
    expect(settings.apiKeyMasked).toContain('AIza');
    expect(settings.promptMarkdown).toBe('## 새 프롬프트');
    expect(settings.outputPath).toBe('/tmp/output');
  });

  it('does not log raw api key', () => {
    const info = vi.fn();
    const error = vi.fn();
    const rawKey = 'AIza-raw-secret';
    const service = createSettingsService({ store: createMemoryStore(), logger: { info, error } });

    service.updateSettings({ apiKey: rawKey });

    const combinedLogs = [...info.mock.calls, ...error.mock.calls].map((call) => JSON.stringify(call)).join('\n');
    expect(combinedLogs).not.toContain(rawKey);
  });

  it('testApiKey uses stored key when input is omitted', async () => {
    const service = createSettingsService({ store: createMemoryStore({ 'settings.apiKey': 'AIza-stored' }), logger: { info: vi.fn(), error: vi.fn() } });
    await expect(service.testApiKey()).resolves.toEqual({ ok: true, message: 'API 키 형식이 유효합니다.' });
  });

  it('keeps saved values when service is recreated with same store (restart-like)', () => {
    const sharedStore = createMemoryStore();
    const firstService = createSettingsService({ store: sharedStore, logger: { info: vi.fn(), error: vi.fn() } });
    firstService.updateSettings({
      apiKey: 'AIza-restart-check',
      promptMarkdown: '## 재시작 프롬프트',
      outputPath: '/tmp/restart-output',
    });

    const secondService = createSettingsService({ store: sharedStore, logger: { info: vi.fn(), error: vi.fn() } });
    const restored = secondService.getSettings();

    expect(restored.promptMarkdown).toBe('## 재시작 프롬프트');
    expect(restored.outputPath).toBe('/tmp/restart-output');
    expect(restored.apiKeyMasked).toContain('AIza');
    expect(restored.apiKeyMasked).not.toContain('restart-check');
  });

  it('returns failure when testApiKey has no key', async () => {
    const service = createSettingsService({ store: createMemoryStore(), logger: { info: vi.fn(), error: vi.fn() } });
    await expect(service.testApiKey()).resolves.toEqual({ ok: false, message: 'API 키를 먼저 입력해주세요.' });
  });

  it('does not create article bundle files before manual save', () => {
    const outputDir = mkdtempSync(join(tmpdir(), 'bwa-settings-'));
    const service = createSettingsService({ store: createMemoryStore(), logger: { info: vi.fn(), error: vi.fn() } });

    service.updateSettings({ outputPath: outputDir });
    const files = readdirSync(outputDir);

    expect(files).toEqual([]);
  });
});
