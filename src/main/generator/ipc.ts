import { IPC_CHANNELS } from '../../shared/ipc';
import type { GenerateArticleInput } from './generator-service';

type IpcMainLike = {
  handle: (channel: string, handler: (event: unknown, ...args: unknown[]) => unknown | Promise<unknown>) => void;
};

type SettingsServiceLike = {
  getGenerationSettings: () => { apiKey: string; promptMarkdown: string };
};

type GeneratorServiceLike = {
  generateArticle: (input: GenerateArticleInput) => Promise<{ markdown: string; grounding?: unknown }>;
};

type RegisterGeneratorIpcHandlersArgs = {
  ipcMain: IpcMainLike;
  settingsService: SettingsServiceLike;
  generatorService: GeneratorServiceLike;
};

function parsePayload(payload: unknown): { topic: string; imagePath?: string } {
  if (typeof payload !== 'object' || payload === null) {
    return { topic: '' };
  }

  const normalizedPayload = payload as Record<string, unknown>;
  const topic = typeof normalizedPayload.topic === 'string' ? normalizedPayload.topic : '';
  const imagePath = typeof normalizedPayload.imagePath === 'string' ? normalizedPayload.imagePath : undefined;
  return { topic, imagePath };
}

export function registerGeneratorIpcHandlers({
  ipcMain,
  settingsService,
  generatorService,
}: RegisterGeneratorIpcHandlersArgs): void {
  ipcMain.handle(IPC_CHANNELS.generatorGenerate, async (_event, payload: unknown) => {
    const parsedPayload = parsePayload(payload);
    const generationSettings = settingsService.getGenerationSettings();
    return generatorService.generateArticle({
      apiKey: generationSettings.apiKey,
      promptMarkdown: generationSettings.promptMarkdown,
      topic: parsedPayload.topic,
      imagePath: parsedPayload.imagePath,
    });
  });
}
