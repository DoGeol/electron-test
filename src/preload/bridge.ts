import type { IpcRenderer } from 'electron';
import { IPC_CHANNELS, type SettingsPayload, type UpdateSettingsPayload } from '../shared/ipc';

export type BridgeApi = ReturnType<typeof createBridgeApi>;

export function createBridgeApi(ipcRenderer: Pick<IpcRenderer, 'invoke'>) {
  return {
    settings: {
      get: () => ipcRenderer.invoke(IPC_CHANNELS.settingsGet) as Promise<SettingsPayload>,
      update: (payload: UpdateSettingsPayload) => ipcRenderer.invoke(IPC_CHANNELS.settingsUpdate, payload) as Promise<void>,
      testApiKey: (apiKey: string) => ipcRenderer.invoke(IPC_CHANNELS.settingsTestApiKey, apiKey) as Promise<{ ok: boolean; message: string }>,
    },
    generator: {
      generate: (payload: { topic: string; promptMarkdown: string; imagePath?: string }) =>
        ipcRenderer.invoke(IPC_CHANNELS.generatorGenerate, payload) as Promise<{ markdown: string; grounding?: unknown }>,
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
