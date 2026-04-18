import { app, BrowserWindow, clipboard, dialog, ipcMain } from 'electron';
import Store from 'electron-store';
import { join } from 'node:path';
import { createClipboardService } from './article/clipboard-service';
import { registerArticleIpcHandlers } from './article/ipc';
import { createArticleSaveService } from './article/save-service';
import { registerGeneratorIpcHandlers } from './generator/ipc';
import { createGeneratorService } from './generator/generator-service';
import { registerSettingsIpcHandlers } from './settings/ipc';
import { createSettingsService } from './settings/settings-service';
import { resolvePreloadPath } from './preload-path';

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 1024,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: resolvePreloadPath(__dirname),
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
  const generatorService = createGeneratorService({
    logger: {
      info: (message, meta) => {
        console.info(message, meta);
      },
      error: (message, meta) => {
        console.error(message, meta);
      },
    },
  });
  const articleSaveService = createArticleSaveService();
  const clipboardService = createClipboardService({
    clipboard,
  });

  registerSettingsIpcHandlers({
    ipcMain,
    settingsService,
    dialog,
    browserWindow: BrowserWindow,
  });
  registerGeneratorIpcHandlers({
    ipcMain,
    settingsService,
    generatorService,
  });
  registerArticleIpcHandlers({
    ipcMain,
    settingsService,
    articleSaveService,
    clipboardService,
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
