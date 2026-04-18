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

function createBridgeMock(overrides?: Partial<BridgeMock['clipboard']>): BridgeMock {
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
    },
    clipboard: {
      copyNaver: vi.fn(async () => ({ ok: true })),
      copyMarkdown: vi.fn(async () => ({ ok: true })),
      copySelectionNaver: vi.fn(async () => ({ ok: true })),
      ...overrides,
    },
  };
}

describe('App clipboard integration', () => {
  beforeEach(() => {
    (window as unknown as { bridge: BridgeMock }).bridge = createBridgeMock();
  });

  it('copies full article to naver html clipboard', async () => {
    const bridge = createBridgeMock();
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);

    fireEvent.change(screen.getByLabelText('주제'), { target: { value: '제주 2박 3일 여행 코스' } });
    fireEvent.click(screen.getByRole('button', { name: 'AI 글 생성' }));
    await screen.findByText('글 생성이 완료되었습니다.');

    fireEvent.click(screen.getByRole('button', { name: '전체 글 네이버 복사' }));

    await waitFor(() => {
      expect(bridge.clipboard.copyNaver).toHaveBeenCalledWith(
        ['# 생성된 블로그 글', '', '첫 본문 내용', '', '---', '', '## 두번째 블록', '', '둘째 본문 내용'].join('\n')
      );
    });
    expect(await screen.findByText('전체 글을 네이버 형식으로 복사했습니다.')).toBeInTheDocument();
  });

  it('copies current markdown text for debug fallback', async () => {
    const bridge = createBridgeMock();
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);

    fireEvent.change(screen.getByLabelText('주제'), { target: { value: '서울 전시 추천' } });
    fireEvent.click(screen.getByRole('button', { name: 'AI 글 생성' }));
    await screen.findByText('글 생성이 완료되었습니다.');

    fireEvent.click(screen.getByRole('button', { name: '전체 마크다운 복사' }));

    await waitFor(() => {
      expect(bridge.clipboard.copyMarkdown).toHaveBeenCalledWith(
        ['# 생성된 블로그 글', '', '첫 본문 내용', '', '---', '', '## 두번째 블록', '', '둘째 본문 내용'].join('\n')
      );
    });
    expect(await screen.findByText('마크다운을 복사했습니다.')).toBeInTheDocument();
  });

  it('copies a single article block as markdown', async () => {
    const bridge = createBridgeMock();
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);

    fireEvent.change(screen.getByLabelText('주제'), { target: { value: '부산 카페 투어' } });
    fireEvent.click(screen.getByRole('button', { name: 'AI 글 생성' }));
    await screen.findByText('글 생성이 완료되었습니다.');

    fireEvent.click(screen.getAllByRole('button', { name: '마크다운 복사' })[0]);

    await waitFor(() => {
      expect(bridge.clipboard.copyMarkdown).toHaveBeenCalledWith('# 생성된 블로그 글\n\n첫 본문 내용');
    });
    expect(await screen.findByText('본문 블록 1번 마크다운을 복사했습니다.')).toBeInTheDocument();
  });

  it('copies a single article block as naver html', async () => {
    const bridge = createBridgeMock();
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);

    fireEvent.change(screen.getByLabelText('주제'), { target: { value: '부산 카페 투어' } });
    fireEvent.click(screen.getByRole('button', { name: 'AI 글 생성' }));
    await screen.findByText('글 생성이 완료되었습니다.');

    fireEvent.click(screen.getAllByRole('button', { name: '네이버 복사' })[1]);

    await waitFor(() => {
      expect(bridge.clipboard.copySelectionNaver).toHaveBeenCalledWith('## 두번째 블록\n\n둘째 본문 내용');
    });
    expect(await screen.findByText('본문 블록 2번을 네이버 형식으로 복사했습니다.')).toBeInTheDocument();
  });

  it('guards selected paragraph copy when no editor paragraph is selected', async () => {
    const bridge = createBridgeMock();
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);

    fireEvent.change(screen.getByLabelText('주제'), { target: { value: '부산 카페 투어' } });
    fireEvent.click(screen.getByRole('button', { name: 'AI 글 생성' }));
    await screen.findByText('글 생성이 완료되었습니다.');

    fireEvent.click(screen.getByRole('button', { name: '블록 1 편집' }));
    fireEvent.click(screen.getByRole('button', { name: '선택 문단 네이버 복사' }));

    expect(bridge.clipboard.copySelectionNaver).not.toHaveBeenCalled();
    expect(await screen.findByText('선택된 문단이 없습니다. 복사할 문단을 먼저 선택해주세요.')).toBeInTheDocument();
  });

  it('copies and deletes multiple selected article blocks', async () => {
    const bridge = createBridgeMock();
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);

    fireEvent.change(screen.getByLabelText('주제'), { target: { value: '부산 카페 투어' } });
    fireEvent.click(screen.getByRole('button', { name: 'AI 글 생성' }));
    await screen.findByText('글 생성이 완료되었습니다.');

    fireEvent.click(screen.getByLabelText('블록 1 선택'));
    fireEvent.click(screen.getByLabelText('블록 2 선택'));
    fireEvent.click(screen.getByRole('button', { name: '선택 블록 네이버 복사' }));

    await waitFor(() => {
      expect(bridge.clipboard.copySelectionNaver).toHaveBeenCalledWith(
        ['# 생성된 블로그 글', '', '첫 본문 내용', '', '---', '', '## 두번째 블록', '', '둘째 본문 내용'].join('\n')
      );
    });
    expect(await screen.findByText('선택 블록을 네이버 형식으로 복사했습니다.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '선택 블록 삭제' }));

    expect(await screen.findByText('선택 블록을 삭제했습니다.')).toBeInTheDocument();
    expect(screen.getByText('생성된 본문이 없습니다.')).toBeInTheDocument();
  });

  it('activates inline editing by clicking a block preview without rendering edit buttons', async () => {
    const bridge = createBridgeMock();
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);

    fireEvent.change(screen.getByLabelText('주제'), { target: { value: '부산 카페 투어' } });
    fireEvent.click(screen.getByRole('button', { name: 'AI 글 생성' }));
    await screen.findByText('글 생성이 완료되었습니다.');

    expect(screen.queryByRole('button', { name: '편집' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '블록 1 편집' }));

    expect(screen.queryByRole('button', { name: '블록 1 편집' })).not.toBeInTheDocument();
  });
});
