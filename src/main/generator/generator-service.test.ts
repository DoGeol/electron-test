// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import { createGeneratorService } from './generator-service';

type GenerateContentRequest = {
  model: string;
  contents: Array<{ role: string; parts: Array<{ text?: string; inlineData?: { mimeType?: string; data?: string } }> }>;
  config?: { tools?: Array<{ googleSearch?: Record<string, never> }> };
};

function createService(overrides?: {
  generateContent?: ReturnType<typeof vi.fn>;
  readFile?: ReturnType<typeof vi.fn>;
}) {
  const generateContent =
    overrides?.generateContent ??
    vi.fn(async () => ({
      text: '# 생성된 글',
      candidates: [],
    }));

  const readFile = overrides?.readFile ?? vi.fn(async () => Buffer.from('image-binary'));
  const createGeminiClient = vi.fn(() => ({
    generateContent: generateContent as unknown as (request: unknown) => Promise<unknown>,
  }));
  const logger = { info: vi.fn(), error: vi.fn() };

  const service = createGeneratorService({
    createGeminiClient: createGeminiClient as unknown as Parameters<typeof createGeneratorService>[0]['createGeminiClient'],
    fileSystem: {
      readFile: readFile as unknown as (path: string) => Promise<Buffer>,
    },
    logger,
  });

  return {
    service,
    createGeminiClient,
    generateContent,
    readFile,
    logger,
  };
}

describe('createGeneratorService', () => {
  it('builds gemini request with googleSearch tool and markdown prompt', async () => {
    const { service, createGeminiClient, generateContent } = createService();

    await service.generateArticle({
      apiKey: 'AIza-valid-key',
      topic: '제주 봄 여행 코스',
      promptMarkdown: '## {{topic}}\n{{format_rules}}',
      imagePath: '/tmp/sample.png',
    });

    expect(createGeminiClient).toHaveBeenCalledWith('AIza-valid-key');
    const request = generateContent.mock.calls[0]?.[0] as GenerateContentRequest;
    expect(request.model).toBe('gemini-2.5-flash');
    expect(request.config?.tools).toEqual([{ googleSearch: {} }]);
    expect(request.contents[0]?.parts[0]?.text).toContain('제주 봄 여행 코스');
    expect(request.contents[0]?.parts[0]?.text).toContain('Markdown');
    expect(request.contents[0]?.parts[0]?.text).toContain('단독 줄 ---');
  });

  it('injects topic and image context even when the saved prompt has no template tokens', async () => {
    const { service, generateContent } = createService();

    await service.generateArticle({
      apiKey: 'AIza-valid-key',
      topic: 'JVM 터치온 드라이기 사용 리뷰',
      promptMarkdown: '제품 사진을 바탕으로 리뷰를 작성해줘.',
      imagePath: '/tmp/touch-on.jpeg',
    });

    const request = generateContent.mock.calls[0]?.[0] as GenerateContentRequest;
    const promptText = request.contents[0]?.parts[0]?.text ?? '';
    expect(promptText).toContain('## 입력 정보');
    expect(promptText).toContain('- 주제: JVM 터치온 드라이기 사용 리뷰');
    expect(promptText).toContain('touch-on.jpeg');
    expect(promptText).toContain('제품 사진을 바탕으로 리뷰를 작성해줘.');
  });

  it('converts one image to inlineData part and validates extension', async () => {
    const { service, generateContent, readFile } = createService();

    await service.generateArticle({
      apiKey: 'AIza-valid-key',
      topic: '부산 카페 추천',
      promptMarkdown: '## {{topic}}',
      imagePath: '/tmp/cover.WEBP',
    });

    expect(readFile).toHaveBeenCalledWith('/tmp/cover.WEBP');
    const request = generateContent.mock.calls[0]?.[0] as GenerateContentRequest;
    const imagePart = request.contents[0]?.parts[1];
    expect(imagePart?.inlineData?.mimeType).toBe('image/webp');
    expect(imagePart?.inlineData?.data).toBe(Buffer.from('image-binary').toString('base64'));
  });

  it('rejects unsupported image extension before API call', async () => {
    const { service, generateContent } = createService();

    await expect(
      service.generateArticle({
        apiKey: 'AIza-valid-key',
        topic: '제주 맛집',
        promptMarkdown: '## {{topic}}',
        imagePath: '/tmp/bad.gif',
      })
    ).rejects.toThrow('지원하지 않는 이미지 형식입니다.');

    expect(generateContent).not.toHaveBeenCalled();
  });

  it('returns grounding metadata from candidate response', async () => {
    const { service } = createService({
      generateContent: vi.fn(async () => ({
        text: '# 초안',
        candidates: [
          {
            groundingMetadata: {
              webSearchQueries: ['제주 여행 2026'],
              groundingChunks: [{ web: { title: '제주 관광', uri: 'https://example.com/jeju' } }],
            },
          },
        ],
      })),
    });

    const result = await service.generateArticle({
      apiKey: 'AIza-valid-key',
      topic: '제주 여행',
      promptMarkdown: '## {{topic}}',
    });

    expect(result.markdown).toBe('# 초안');
    expect(result.grounding).toEqual({
      webSearchQueries: ['제주 여행 2026'],
      sources: [{ title: '제주 관광', uri: 'https://example.com/jeju' }],
    });
  });

  it('maps non-streaming error to user-facing message', async () => {
    const { service } = createService({
      generateContent: vi.fn(async () => {
        throw new Error('429 rate limit exceeded');
      }),
    });

    await expect(
      service.generateArticle({
        apiKey: 'AIza-valid-key',
        topic: '서울 전시회 추천',
        promptMarkdown: '## {{topic}}',
      })
    ).rejects.toThrow('요청이 너무 많습니다.');
  });

  it('rejects empty model response', async () => {
    const { service } = createService({
      generateContent: vi.fn(async () => ({
        text: '   ',
        candidates: [],
      })),
    });

    await expect(
      service.generateArticle({
        apiKey: 'AIza-valid-key',
        topic: '한강 러닝 코스',
        promptMarkdown: '## {{topic}}',
      })
    ).rejects.toThrow('AI 응답이 비어 있습니다.');
  });

  it('rejects safety-filtered response', async () => {
    const { service } = createService({
      generateContent: vi.fn(async () => ({
        text: '',
        candidates: [{ finishReason: 'SAFETY' }],
      })),
    });

    await expect(
      service.generateArticle({
        apiKey: 'AIza-valid-key',
        topic: '정책 위반 가능 주제',
        promptMarkdown: '## {{topic}}',
      })
    ).rejects.toThrow('안전성 정책으로 인해 응답이 차단되었습니다.');
  });
});
