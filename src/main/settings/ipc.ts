import type { OpenDialogReturnValue } from 'electron';
import { IPC_CHANNELS, type UpdateSettingsPayload } from '../../shared/ipc';

type IpcMainLike = {
  handle: (channel: string, handler: (event: unknown, ...args: unknown[]) => unknown | Promise<unknown>) => void;
};

type SettingsServiceLike = {
  getSettings: () => { apiKeyMasked: string; promptMarkdown: string; outputPath: string };
  updateSettings: (payload: UpdateSettingsPayload) => void;
  testApiKey: (apiKeyInput?: string) => Promise<{ ok: boolean; message: string }>;
};

type DialogLike = {
  showOpenDialog: (options: { properties: Array<'openDirectory' | 'createDirectory'>; title?: string }) => Promise<OpenDialogReturnValue>;
};

type RegisterSettingsIpcHandlersArgs = {
  ipcMain: IpcMainLike;
  settingsService: SettingsServiceLike;
  dialog: DialogLike;
};

export function registerSettingsIpcHandlers({ ipcMain, settingsService, dialog }: RegisterSettingsIpcHandlersArgs): void {
  ipcMain.handle(IPC_CHANNELS.settingsGet, () => settingsService.getSettings());

  ipcMain.handle(IPC_CHANNELS.settingsUpdate, (_event, payload: unknown) => {
    settingsService.updateSettings((payload ?? {}) as UpdateSettingsPayload);
  });

  ipcMain.handle(IPC_CHANNELS.settingsTestApiKey, (_event, apiKeyInput: unknown) =>
    settingsService.testApiKey(typeof apiKeyInput === 'string' ? apiKeyInput : undefined)
  );

  ipcMain.handle(IPC_CHANNELS.settingsSelectOutputPath, async () => {
    const result = await dialog.showOpenDialog({
      title: '저장 경로 선택',
      properties: ['openDirectory', 'createDirectory'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const selectedPath = result.filePaths[0];
    settingsService.updateSettings({ outputPath: selectedPath });
    return selectedPath;
  });
}
