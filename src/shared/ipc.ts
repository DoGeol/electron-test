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

export type GroundingSource = {
  title: string;
  uri: string;
};

export type GroundingPayload = {
  webSearchQueries: string[];
  sources: GroundingSource[];
};

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

export type GeneratorGeneratePayload = {
  topic: string;
  imagePath?: string;
};

export type GeneratorGenerateResult = {
  markdown: string;
  grounding?: GroundingPayload;
};

export type ArticleSavePayload = {
  markdown: string;
  metadata: {
    topic?: string;
    imagePath?: string;
    grounding?: GroundingPayload;
  };
};

export type ArticleSaveResult = {
  ok: boolean;
  path: string;
};
