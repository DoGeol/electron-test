import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import Store from 'electron-store';
import { join } from 'node:path';
import { registerSettingsIpcHandlers } from './settings/ipc';
import { createSettingsService } from './settings/settings-service';

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 1024,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  window.on('ready-to-show', () => {
    window.show();
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  const store = new Store<Record<string, unknown>>({
    name: 'blog-writing-assistant',
  });
  const settingsService = createSettingsService({
    store,
    logger: {
      info: (message, meta) => {
        console.info(message, meta);
      },
      error: (message, meta) => {
        console.error(message, meta);
      },
    },
  });

  registerSettingsIpcHandlers({
    ipcMain,
    settingsService,
    dialog,
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
