import { readFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import type { GenerateContentParameters } from '@google/genai';
import { interpolatePrompt } from '../../shared/domain/prompt';
import type { GeneratorGenerateResult, GroundingPayload, GroundingSource } from '../../shared/ipc';
import { createGeminiClient, type GeminiClientFactory } from './gemini-client';

const GEMINI_MODEL = 'gemini-2.5-flash';

const IMAGE_MIME_BY_EXT: Record<string, 'image/png' | 'image/jpeg' | 'image/webp'> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

type GeneratorLogger = {
  info: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
};

type FileSystemLike = {
  readFile: (path: string) => Promise<Buffer>;
};

type GeneratorServiceDeps = {
  createGeminiClient?: GeminiClientFactory;
  fileSystem?: FileSystemLike;
  logger: GeneratorLogger;
};

export type GenerateArticleInput = {
  apiKey: string;
  topic: string;
  promptMarkdown: string;
  imagePath?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getMimeTypeFromPath(imagePath: string): 'image/png' | 'image/jpeg' | 'image/webp' {
  const ext = extname(imagePath).toLowerCase();
  const mimeType = IMAGE_MIME_BY_EXT[ext];
  if (!mimeType) {
    throw new Error('지원하지 않는 이미지 형식입니다. PNG, JPG, WEBP만 사용할 수 있습니다.');
  }

  return mimeType;
}

function buildPrompt(topic: string, promptMarkdown: string, imagePath?: string): string {
  const imageContext = imagePath ? `참고 이미지 파일명: ${basename(imagePath)}` : '참고 이미지 없음';
  const interpolated = interpolatePrompt(promptMarkdown, {
    topic,
    image_context: imageContext,
    style: '정보 전달 중심의 자연스러운 한국어 블로그 문체',
    format_rules: '반드시 Markdown 형식으로만 출력하고 제목, 본문, 태그를 포함',
  });

  return [
    interpolated.trim(),
    '## 출력 제약',
    '- 반드시 Markdown 형식으로만 출력',
    '- HTML, JSON, 코드블록 래퍼를 추가하지 않음',
    '- 본문 내부에 Grounding 출처를 자동 삽입하지 않음',
  ].join('\n');
}

function extractGroundingPayload(groundingMetadata: unknown): GroundingPayload | undefined {
  if (!isRecord(groundingMetadata)) {
    return undefined;
  }

  const webSearchQueries = Array.isArray(groundingMetadata.webSearchQueries)
    ? groundingMetadata.webSearchQueries.filter((query): query is string => typeof query === 'string')
    : [];

  const groundingChunks = Array.isArray(groundingMetadata.groundingChunks) ? groundingMetadata.groundingChunks : [];
  const sourceKeySet = new Set<string>();
  const sources: GroundingSource[] = [];

  for (const chunk of groundingChunks) {
    if (!isRecord(chunk) || !isRecord(chunk.web)) {
      continue;
    }

    const title = typeof chunk.web.title === 'string' ? chunk.web.title : '';
    const uri = typeof chunk.web.uri === 'string' ? chunk.web.uri : '';
    if (!title || !uri) {
      continue;
    }

    const dedupeKey = `${title}::${uri}`;
    if (sourceKeySet.has(dedupeKey)) {
      continue;
    }

    sourceKeySet.add(dedupeKey);
    sources.push({ title, uri });
  }

  if (webSearchQueries.length === 0 && sources.length === 0) {
    return undefined;
  }

  return {
    webSearchQueries,
    sources,
  };
}

function mapProviderError(error: unknown): Error {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const message = rawMessage.toLowerCase();

  if (message.includes('429') || message.includes('rate limit') || message.includes('too many requests')) {
    return new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
  }

  if (
    message.includes('api key') ||
    message.includes('unauthorized') ||
    message.includes('permission denied') ||
    message.includes('invalid authentication')
  ) {
    return new Error('API 키가 올바르지 않거나 권한이 없습니다. 설정을 확인해주세요.');
  }

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('econn') ||
    message.includes('timed out') ||
    message.includes('timeout')
  ) {
    return new Error('네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.');
  }

  return new Error('글 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
}

function extractResponseText(response: unknown): string {
  if (!isRecord(response)) {
    return '';
  }

  const text = typeof response.text === 'string' ? response.text : '';
  return text.trim();
}

function isSafetyResponse(response: unknown): boolean {
  if (!isRecord(response) || !Array.isArray(response.candidates)) {
    return false;
  }

  const firstCandidate = response.candidates[0];
  return isRecord(firstCandidate) && firstCandidate.finishReason === 'SAFETY';
}

function extractGroundingFromResponse(response: unknown): GroundingPayload | undefined {
  if (!isRecord(response) || !Array.isArray(response.candidates)) {
    return undefined;
  }

  const firstCandidate = response.candidates[0];
  if (!isRecord(firstCandidate)) {
    return undefined;
  }

  return extractGroundingPayload(firstCandidate.groundingMetadata);
}

export function createGeneratorService({
  createGeminiClient: createGeminiClientFn = createGeminiClient,
  fileSystem = { readFile },
  logger,
}: GeneratorServiceDeps) {
  return {
    async generateArticle(input: GenerateArticleInput): Promise<GeneratorGenerateResult> {
      const apiKey = input.apiKey.trim();
      const topic = input.topic.trim();
      const promptMarkdown = input.promptMarkdown.trim();

      if (!apiKey) {
        throw new Error('API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요.');
      }

      if (!topic) {
        throw new Error('주제를 입력해주세요.');
      }

      if (!promptMarkdown) {
        throw new Error('기본 프롬프트가 비어 있습니다. 설정 페이지에서 프롬프트를 입력해주세요.');
      }

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
        { text: buildPrompt(topic, promptMarkdown, input.imagePath) },
      ];

      if (input.imagePath) {
        const mimeType = getMimeTypeFromPath(input.imagePath);
        const imageBuffer = await fileSystem.readFile(input.imagePath);
        if (imageBuffer.byteLength === 0) {
          throw new Error('빈 이미지는 사용할 수 없습니다.');
        }

        parts.push({
          inlineData: {
            mimeType,
            data: imageBuffer.toString('base64'),
          },
        });
      }

      const request: GenerateContentParameters = {
        model: GEMINI_MODEL,
        contents: [
          {
            role: 'user',
            parts,
          },
        ],
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'text/plain',
        },
      };

      logger.info('gemini generation requested', {
        topicLength: topic.length,
        promptLength: promptMarkdown.length,
        hasImage: Boolean(input.imagePath),
      });

      const client = createGeminiClientFn(apiKey);
      let response: unknown;
      try {
        response = await client.generateContent(request);
      } catch (error) {
        const mappedError = mapProviderError(error);
        logger.error('gemini generation failed', { errorMessage: mappedError.message });
        throw mappedError;
      }

      if (isSafetyResponse(response)) {
        throw new Error('안전성 정책으로 인해 응답이 차단되었습니다. 입력을 조정한 뒤 다시 시도해주세요.');
      }

      const markdown = extractResponseText(response);
      if (!markdown) {
        throw new Error('AI 응답이 비어 있습니다. 프롬프트를 조정한 뒤 다시 시도해주세요.');
      }

      return {
        markdown,
        grounding: extractGroundingFromResponse(response),
      };
    },
  };
}
