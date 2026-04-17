export type Settings = {
  apiKeyMasked: string;
  promptMarkdown: string;
  outputPath: string;
};

export const DEFAULT_SETTINGS: Settings = {
  apiKeyMasked: '',
  promptMarkdown: '',
  outputPath: '',
};
