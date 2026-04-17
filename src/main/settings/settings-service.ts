import type { SettingsPayload, UpdateSettingsPayload } from '../../shared/ipc';

const STORE_KEYS = {
  apiKey: 'settings.apiKey',
  promptMarkdown: 'settings.promptMarkdown',
  outputPath: 'settings.outputPath',
} as const;

export const DEFAULT_PROMPT_MARKDOWN = '## 출력 형식\n- Markdown만 반환\n- 제목, 본문, 태그 포함';

type SettingsStore = {
  get: <T>(key: string) => T | undefined;
  set: (key: string, value: unknown) => void;
};

type SettingsLogger = {
  info: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
};

type SettingsServiceDeps = {
  store: SettingsStore;
  logger: SettingsLogger;
};

function normalizeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeApiKey(value: string): string {
  return value.trim();
}

function maskApiKey(rawKey: string): string {
  if (rawKey.length === 0) {
    return '';
  }

  const visible = rawKey.slice(0, 4);
  const hiddenLength = Math.max(4, rawKey.length - 4);
  return `${visible}${'*'.repeat(hiddenLength)}`;
}

function isProbablyGeminiApiKey(key: string): boolean {
  return /^AIza[\w-]{6,}$/.test(key);
}

export function createSettingsService({ store, logger }: SettingsServiceDeps) {
  const getRawApiKey = () => normalizeString(store.get<string>(STORE_KEYS.apiKey));
  const getPromptMarkdown = () => normalizeString(store.get<string>(STORE_KEYS.promptMarkdown), DEFAULT_PROMPT_MARKDOWN);
  const getOutputPath = () => normalizeString(store.get<string>(STORE_KEYS.outputPath));

  return {
    getGenerationSettings(): { apiKey: string; promptMarkdown: string } {
      return {
        apiKey: getRawApiKey(),
        promptMarkdown: getPromptMarkdown(),
      };
    },

    getSettings(): SettingsPayload {
      const apiKey = getRawApiKey();
      return {
        apiKeyMasked: maskApiKey(apiKey),
        promptMarkdown: getPromptMarkdown(),
        outputPath: getOutputPath(),
      };
    },

    updateSettings(payload: UpdateSettingsPayload): void {
      if (payload.apiKey !== undefined) {
        store.set(STORE_KEYS.apiKey, normalizeApiKey(payload.apiKey));
      }

      if (payload.promptMarkdown !== undefined) {
        store.set(STORE_KEYS.promptMarkdown, payload.promptMarkdown);
      }

      if (payload.outputPath !== undefined) {
        store.set(STORE_KEYS.outputPath, payload.outputPath);
      }

      logger.info('settings updated', {
        hasApiKey: getRawApiKey().length > 0,
        hasOutputPath: getOutputPath().length > 0,
        promptLength: getPromptMarkdown().length,
      });
    },

    async testApiKey(apiKeyInput?: string): Promise<{ ok: boolean; message: string }> {
      const candidate = normalizeApiKey(apiKeyInput ?? getRawApiKey());
      if (candidate.length === 0) {
        return { ok: false, message: 'API 키를 먼저 입력해주세요.' };
      }

      if (!isProbablyGeminiApiKey(candidate)) {
        logger.error('API key format check failed', { reason: 'invalid_format', length: candidate.length });
        return { ok: false, message: 'API 키 형식이 올바르지 않습니다.' };
      }

      return { ok: true, message: 'API 키 형식이 유효합니다.' };
    },
  };
}
