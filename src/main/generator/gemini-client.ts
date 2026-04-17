import { GoogleGenAI, type GenerateContentParameters, type GenerateContentResponse } from '@google/genai';

export type GeminiClient = {
  generateContent: (request: GenerateContentParameters) => Promise<GenerateContentResponse>;
};

export type GeminiClientFactory = (apiKey: string) => GeminiClient;

export const createGeminiClient: GeminiClientFactory = (apiKey) => {
  const client = new GoogleGenAI({ apiKey });

  return {
    generateContent: (request) => client.models.generateContent(request),
  };
};
