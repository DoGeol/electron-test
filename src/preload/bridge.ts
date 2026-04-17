import type { IpcRenderer } from 'electron';
import {
  IPC_CHANNELS,
  type GeneratorGeneratePayload,
  type GeneratorGenerateResult,
  type SettingsPayload,
  type UpdateSettingsPayload,
} from '../shared/ipc';

export type BridgeApi = ReturnType<typeof createBridgeApi>;

export function createBridgeApi(ipcRenderer: Pick<IpcRenderer, 'invoke'>) {
  return {
    settings: {
      get: () => ipcRenderer.invoke(IPC_CHANNELS.settingsGet) as Promise<SettingsPayload>,
      update: (payload: UpdateSettingsPayload) => ipcRenderer.invoke(IPC_CHANNELS.settingsUpdate, payload) as Promise<void>,
      testApiKey: (apiKey?: string) => ipcRenderer.invoke(IPC_CHANNELS.settingsTestApiKey, apiKey) as Promise<{ ok: boolean; message: string }>,
      selectOutputPath: () => ipcRenderer.invoke(IPC_CHANNELS.settingsSelectOutputPath) as Promise<string | null>,
    },
    generator: {
      generate: (payload: GeneratorGeneratePayload) =>
        ipcRenderer.invoke(IPC_CHANNELS.generatorGenerate, payload) as Promise<GeneratorGenerateResult>,
    },
    article: {
      save: (payload: { markdown: string; metadata: Record<string, unknown> }) =>
        ipcRenderer.invoke(IPC_CHANNELS.articleSave, payload) as Promise<{ ok: boolean; path: string }>,
    },
    clipboard: {
      copyNaver: (markdown: string) => ipcRenderer.invoke(IPC_CHANNELS.articleCopyNaver, markdown) as Promise<{ ok: boolean }>,
      copyMarkdown: (markdown: string) => ipcRenderer.invoke(IPC_CHANNELS.articleCopyMarkdown, markdown) as Promise<{ ok: boolean }>,
      copySelectionNaver: (markdown: string) =>
        ipcRenderer.invoke(IPC_CHANNELS.articleCopySelectionNaver, markdown) as Promise<{ ok: boolean }>,
    },
  };
}
