import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

type BridgeMock = {
  settings: {
    get: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    testApiKey: ReturnType<typeof vi.fn>;
    chooseOutputPath: ReturnType<typeof vi.fn>;
  };
  generator: {
    generate: ReturnType<typeof vi.fn>;
  };
  article: {
    save: ReturnType<typeof vi.fn>;
  };
  clipboard: {
    copyNaver: ReturnType<typeof vi.fn>;
    copyMarkdown: ReturnType<typeof vi.fn>;
    copySelectionNaver: ReturnType<typeof vi.fn>;
  };
};

function createBridgeMock(overrides?: Partial<BridgeMock['generator']>): BridgeMock {
  return {
    settings: {
      get: vi.fn(async () => ({
        apiKeyMasked: 'AIza****',
        promptMarkdown: '## 저장된 프롬프트',
        outputPath: '/tmp/blog-output',
      })),
      update: vi.fn(async () => undefined),
      testApiKey: vi.fn(async () => ({ ok: true, message: 'ok' })),
      chooseOutputPath: vi.fn(async () => null),
    },
    generator: {
      generate: vi.fn(async () => ({
        markdown: '# 생성된 블로그 글\n\n본문 내용',
        grounding: {
          webSearchQueries: ['제주 여행'],
          sources: [{ title: '공식 관광 사이트', uri: 'https://example.com/jeju' }],
        },
      })),
      ...overrides,
    },
    article: {
      save: vi.fn(async () => ({ ok: true, path: '/tmp/article' })),
    },
    clipboard: {
      copyNaver: vi.fn(async () => ({ ok: true })),
      copyMarkdown: vi.fn(async () => ({ ok: true })),
      copySelectionNaver: vi.fn(async () => ({ ok: true })),
    },
  };
}

function createUploadFile(name: string, type: string, path: string): File {
  const file = new File(['image-bytes'], name, { type });
  Object.defineProperty(file, 'path', {
    value: path,
    writable: false,
  });
  return file;
}

describe('App generator integration', () => {
  beforeEach(() => {
    (window as unknown as { bridge: BridgeMock }).bridge = createBridgeMock();
  });

  it('runs generate flow and renders markdown result', async () => {
    const bridge = createBridgeMock();
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);

    fireEvent.change(screen.getByLabelText('주제'), { target: { value: '제주 2박 3일 여행 코스' } });
    fireEvent.change(screen.getByLabelText('참고 이미지 업로드'), {
      target: { files: [createUploadFile('cover.png', 'image/png', '/tmp/cover.png')] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'AI 글 생성' }));

    await waitFor(() => {
      expect(bridge.generator.generate).toHaveBeenCalledWith({
        topic: '제주 2박 3일 여행 코스',
        imagePath: '/tmp/cover.png',
      });
    });

    expect(await screen.findByText('글 생성이 완료되었습니다.')).toBeInTheDocument();
    expect(screen.getAllByText(/생성된 블로그 글/).length).toBeGreaterThan(0);
    expect(screen.getByText('검색 출처 1건')).toBeInTheDocument();
  });

  it('shows failure message when generate call fails', async () => {
    const bridge = createBridgeMock({
      generate: vi.fn(async () => {
        throw new Error('API 키가 설정되지 않았습니다.');
      }),
    });
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);

    fireEvent.change(screen.getByLabelText('주제'), { target: { value: '서울 전시 추천' } });
    fireEvent.click(screen.getByRole('button', { name: 'AI 글 생성' }));

    expect(await screen.findByText('API 키가 설정되지 않았습니다.')).toBeInTheDocument();
  });
});
