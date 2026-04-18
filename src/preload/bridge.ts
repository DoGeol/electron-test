import type { IpcRenderer } from 'electron';
import {
  type ArticleSavePayload,
  type ArticleSaveResult,
  IPC_CHANNELS,
  type GeneratorGeneratePayload,
  type GeneratorGenerateResult,
  type SettingsPayload,
  type UpdateSettingsPayload,
} from '../shared/ipc';

export type BridgeApi = ReturnType<typeof createBridgeApi>;

type FilePathResolver = {
  getPathForFile: (file: File) => string;
};

function getLegacyFilePath(file: File): string {
  return (file as File & { path?: string }).path ?? '';
}

export function createBridgeApi(ipcRenderer: Pick<IpcRenderer, 'invoke'>, filePathResolver?: FilePathResolver) {
  return {
    settings: {
      get: () => ipcRenderer.invoke(IPC_CHANNELS.settingsGet) as Promise<SettingsPayload>,
      update: (payload: UpdateSettingsPayload) => ipcRenderer.invoke(IPC_CHANNELS.settingsUpdate, payload) as Promise<void>,
      testApiKey: (apiKey?: string) => ipcRenderer.invoke(IPC_CHANNELS.settingsTestApiKey, apiKey) as Promise<{ ok: boolean; message: string }>,
      chooseOutputPath: () => ipcRenderer.invoke(IPC_CHANNELS.settingsChooseOutputPath) as Promise<string | null>,
    },
    generator: {
      generate: (payload: GeneratorGeneratePayload) =>
        ipcRenderer.invoke(IPC_CHANNELS.generatorGenerate, payload) as Promise<GeneratorGenerateResult>,
    },
    article: {
      save: (payload: ArticleSavePayload) => ipcRenderer.invoke(IPC_CHANNELS.articleSave, payload) as Promise<ArticleSaveResult>,
    },
    clipboard: {
      copyNaver: (markdown: string) => ipcRenderer.invoke(IPC_CHANNELS.articleCopyNaver, markdown) as Promise<{ ok: boolean }>,
      copyMarkdown: (markdown: string) => ipcRenderer.invoke(IPC_CHANNELS.articleCopyMarkdown, markdown) as Promise<{ ok: boolean }>,
      copySelectionNaver: (markdown: string) =>
        ipcRenderer.invoke(IPC_CHANNELS.articleCopySelectionNaver, markdown) as Promise<{ ok: boolean }>,
    },
    files: {
      getPathForFile: (file: File) => filePathResolver?.getPathForFile(file) ?? getLegacyFilePath(file),
    },
  };
}
