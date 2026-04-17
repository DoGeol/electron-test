export const IPC_CHANNELS = {
  settingsGet: 'settings:get',
  settingsUpdate: 'settings:update',
  settingsTestApiKey: 'settings:testApiKey',
  settingsSelectOutputPath: 'settings:selectOutputPath',
  articleSave: 'article:save',
  articleCopyNaver: 'clipboard:copyNaver',
  articleCopyMarkdown: 'clipboard:copyMarkdown',
  articleCopySelectionNaver: 'clipboard:copySelectionNaver',
  generatorGenerate: 'generator:generate',
} as const;

export type SettingsPayload = {
  apiKeyMasked: string;
  promptMarkdown: string;
  outputPath: string;
};

export type UpdateSettingsPayload = {
  apiKey?: string;
  promptMarkdown?: string;
  outputPath?: string;
};
