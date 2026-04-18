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

function createBridgeMock(overrides?: Partial<BridgeMock['article']>): BridgeMock {
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
        markdown: '# 생성된 블로그 글\n\n*(사진 1)*\n\n첫 본문 내용\n\n---\n\n## 두번째 블록\n\n![사진](https://example.com/a.png)\n\n둘째 본문 내용',
        grounding: {
          webSearchQueries: ['제주 여행'],
          sources: [{ title: '공식 관광 사이트', uri: 'https://example.com/jeju' }],
        },
      })),
    },
    article: {
      save: vi.fn(async () => ({ ok: true, path: '/tmp/blog-output/2026-04-17-jeju' })),
      ...overrides,
    },
    clipboard: {
      copyNaver: vi.fn(async () => ({ ok: true })),
      copyMarkdown: vi.fn(async () => ({ ok: true })),
      copySelectionNaver: vi.fn(async () => ({ ok: true })),
    },
  };
}

function createDataTransfer() {
  const data = new Map<string, string>();
  return {
    dropEffect: 'move',
    effectAllowed: 'move',
    getData: vi.fn((type: string) => data.get(type) ?? ''),
    setData: vi.fn((type: string, value: string) => {
      data.set(type, value);
    }),
  };
}

describe('App manual save integration', () => {
  beforeEach(() => {
    (window as unknown as { bridge: BridgeMock }).bridge = createBridgeMock();
  });

  it('saves generated article when save button is clicked', async () => {
    const bridge = createBridgeMock();
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);

    fireEvent.change(screen.getByLabelText('주제'), { target: { value: '제주 2박 3일 여행 코스' } });
    fireEvent.click(screen.getByRole('button', { name: 'AI 글 생성' }));

    await screen.findByText('글 생성이 완료되었습니다.');
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(bridge.article.save).toHaveBeenCalled();
    });
  });

  it('saves moved article blocks in the visible order after drag and drop', async () => {
    const bridge = createBridgeMock();
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);

    fireEvent.change(screen.getByLabelText('주제'), { target: { value: '제주 2박 3일 여행 코스' } });
    fireEvent.click(screen.getByRole('button', { name: 'AI 글 생성' }));
    await screen.findByText('글 생성이 완료되었습니다.');

    const dataTransfer = createDataTransfer();
    fireEvent.dragStart(screen.getByRole('button', { name: '블록 1 드래그 이동' }), { dataTransfer });
    fireEvent.dragOver(screen.getByRole('button', { name: '블록 2 편집' }), { dataTransfer });
    fireEvent.drop(screen.getByRole('button', { name: '블록 2 편집' }), { dataTransfer });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(bridge.article.save).toHaveBeenCalledWith({
        markdown: [
          '## 두번째 블록',
          '',
          '![사진](https://example.com/a.png)',
          '',
          '둘째 본문 내용',
          '',
          '---',
          '',
          '# 생성된 블로그 글',
          '',
          '*(사진 1)*',
          '',
          '첫 본문 내용',
        ].join('\n'),
        metadata: {
          topic: '제주 2박 3일 여행 코스',
          imagePath: undefined,
          grounding: {
            webSearchQueries: ['제주 여행'],
            sources: [{ title: '공식 관광 사이트', uri: 'https://example.com/jeju' }],
          },
        },
      });
    });
  });

  it('shows save error message when save fails', async () => {
    const bridge = createBridgeMock({
      save: vi.fn(async () => {
        throw new Error('저장 경로가 설정되지 않았습니다.');
      }),
    });
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);

    fireEvent.change(screen.getByLabelText('주제'), { target: { value: '서울 전시 추천' } });
    fireEvent.click(screen.getByRole('button', { name: 'AI 글 생성' }));
    await screen.findByText('글 생성이 완료되었습니다.');

    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByText('저장 경로가 설정되지 않았습니다.')).toBeInTheDocument();
  });
});
