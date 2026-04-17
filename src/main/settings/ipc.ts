import type { BrowserWindow, OpenDialogOptions, OpenDialogReturnValue, WebContents } from 'electron';
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
  showOpenDialog: {
    (browserWindow: BrowserWindow, options: OpenDialogOptions): Promise<OpenDialogReturnValue>;
    (options: OpenDialogOptions): Promise<OpenDialogReturnValue>;
  };
};

type BrowserWindowStaticLike = {
  fromWebContents: (webContents: WebContents) => BrowserWindow | null;
};

type RegisterSettingsIpcHandlersArgs = {
  ipcMain: IpcMainLike;
  settingsService: SettingsServiceLike;
  dialog: DialogLike;
  browserWindow?: BrowserWindowStaticLike;
};

export function registerSettingsIpcHandlers({ ipcMain, settingsService, dialog, browserWindow }: RegisterSettingsIpcHandlersArgs): void {
  ipcMain.handle(IPC_CHANNELS.settingsGet, () => settingsService.getSettings());

  ipcMain.handle(IPC_CHANNELS.settingsUpdate, (_event, payload: unknown) => {
    settingsService.updateSettings((payload ?? {}) as UpdateSettingsPayload);
  });

  ipcMain.handle(IPC_CHANNELS.settingsTestApiKey, (_event, apiKeyInput: unknown) =>
    settingsService.testApiKey(typeof apiKeyInput === 'string' ? apiKeyInput : undefined)
  );

  ipcMain.handle(IPC_CHANNELS.settingsSelectOutputPath, async (event) => {
    const options: OpenDialogOptions = {
      title: '저장 경로 선택',
      properties: ['openDirectory', 'createDirectory'],
    };
    const sender = typeof event === 'object' && event !== null && 'sender' in event ? event.sender : undefined;
    const parentWindow = sender && browserWindow ? browserWindow.fromWebContents(sender as WebContents) : null;
    const result = parentWindow ? await dialog.showOpenDialog(parentWindow, options) : await dialog.showOpenDialog(options);

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const selectedPath = result.filePaths[0];
    return selectedPath;
  });
}
