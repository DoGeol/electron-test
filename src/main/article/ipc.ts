import { IPC_CHANNELS, type ArticleSavePayload } from '../../shared/ipc';

type IpcMainLike = {
  handle: (channel: string, handler: (event: unknown, ...args: unknown[]) => unknown | Promise<unknown>) => void;
};

type SettingsServiceLike = {
  getSettings: () => { outputPath: string };
};

type ArticleSaveServiceLike = {
  saveArticle: (input: { outputPath: string; markdown: string; metadata: ArticleSavePayload['metadata'] }) => Promise<{ ok: boolean; path: string }>;
};

type ClipboardServiceLike = {
  copyNaver: (markdown: string) => Promise<{ ok: boolean }>;
  copyMarkdown: (markdown: string) => Promise<{ ok: boolean }>;
  copySelectionNaver: (markdown: string) => Promise<{ ok: boolean }>;
};

type RegisterArticleIpcHandlersArgs = {
  ipcMain: IpcMainLike;
  settingsService: SettingsServiceLike;
  articleSaveService: ArticleSaveServiceLike;
  clipboardService: ClipboardServiceLike;
};

function parseSavePayload(payload: unknown): ArticleSavePayload {
  if (typeof payload !== 'object' || payload === null) {
    return { markdown: '', metadata: {} };
  }

  const normalizedPayload = payload as Record<string, unknown>;
  const markdown = typeof normalizedPayload.markdown === 'string' ? normalizedPayload.markdown : '';
  const metadata = typeof normalizedPayload.metadata === 'object' && normalizedPayload.metadata !== null ? (normalizedPayload.metadata as ArticleSavePayload['metadata']) : {};

  return {
    markdown,
    metadata,
  };
}

export function registerArticleIpcHandlers({
  ipcMain,
  settingsService,
  articleSaveService,
  clipboardService,
}: RegisterArticleIpcHandlersArgs): void {
  ipcMain.handle(IPC_CHANNELS.articleSave, async (_event, payload: unknown) => {
    const parsedPayload = parseSavePayload(payload);
    const outputPath = settingsService.getSettings().outputPath;

    if (!outputPath.trim()) {
      throw new Error('저장 경로가 설정되지 않았습니다. 설정 페이지에서 경로를 먼저 지정해주세요.');
    }

    return articleSaveService.saveArticle({
      outputPath,
      markdown: parsedPayload.markdown,
      metadata: parsedPayload.metadata,
    });
  });

  ipcMain.handle(IPC_CHANNELS.articleCopyNaver, async (_event, markdown: unknown) =>
    clipboardService.copyNaver(typeof markdown === 'string' ? markdown : '')
  );
  ipcMain.handle(IPC_CHANNELS.articleCopyMarkdown, async (_event, markdown: unknown) =>
    clipboardService.copyMarkdown(typeof markdown === 'string' ? markdown : '')
  );
  ipcMain.handle(IPC_CHANNELS.articleCopySelectionNaver, async (_event, markdown: unknown) =>
    clipboardService.copySelectionNaver(typeof markdown === 'string' ? markdown : '')
  );
}
