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

function createBridgeMock(overrides?: Partial<BridgeMock['settings']>): BridgeMock {
  const settingsGet = vi.fn(async () => ({
    apiKeyMasked: 'AIza****',
    promptMarkdown: '## 저장된 프롬프트',
    outputPath: '/tmp/blog-output',
  }));

  return {
    settings: {
      get: settingsGet,
      update: vi.fn(async () => undefined),
      testApiKey: vi.fn(async () => ({ ok: true, message: 'API 키 형식이 유효합니다.' })),
      chooseOutputPath: vi.fn(async () => null),
      ...overrides,
    },
    generator: {
      generate: vi.fn(async () => ({ markdown: '', grounding: undefined })),
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

function createStatefulBridgeMock(overrides?: Partial<BridgeMock['settings']>): BridgeMock {
  const state = {
    apiKeyMasked: 'AIza****',
    promptMarkdown: '## 저장된 프롬프트',
    outputPath: '/tmp/blog-output',
  };

  return createBridgeMock({
    get: vi.fn(async () => ({ ...state })),
    update: vi.fn(async (payload: { apiKey?: string; promptMarkdown?: string; outputPath?: string }) => {
      if (payload.promptMarkdown !== undefined) {
        state.promptMarkdown = payload.promptMarkdown;
      }
      if (payload.outputPath !== undefined) {
        state.outputPath = payload.outputPath;
      }
      if (payload.apiKey !== undefined) {
        state.apiKeyMasked = 'AIza****';
      }
    }),
    ...overrides,
  });
}

describe('App settings integration', () => {
  beforeEach(() => {
    (window as unknown as { bridge: BridgeMock }).bridge = createBridgeMock();
  });

  it('loads persisted settings when settings page opens', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '설정' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Gemini API 키')).toHaveValue('AIza****');
      expect(screen.getByLabelText('기본 프롬프트 (Markdown)')).toHaveValue('## 저장된 프롬프트');
      expect(screen.getByLabelText('저장 경로')).toHaveValue('/tmp/blog-output');
    });
  });

  it('saves edited settings through bridge.update', async () => {
    const bridge = createBridgeMock();
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '설정' }));

    await waitFor(() => {
      expect(bridge.settings.get).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByLabelText('Gemini API 키'), { target: { value: 'AIza-new-key' } });
    fireEvent.change(screen.getByLabelText('기본 프롬프트 (Markdown)'), { target: { value: '## 바뀐 프롬프트' } });
    fireEvent.change(screen.getByLabelText('저장 경로'), { target: { value: '/tmp/changed' } });
    fireEvent.click(screen.getByRole('button', { name: '설정 저장' }));

    await waitFor(() => {
      expect(bridge.settings.update).toHaveBeenCalledWith({
        apiKey: 'AIza-new-key',
        promptMarkdown: '## 바뀐 프롬프트',
        outputPath: '/tmp/changed',
      });
    });
    expect(bridge.settings.get).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Gemini API 키')).toHaveValue('AIza-new-key');
    expect(screen.getByLabelText('기본 프롬프트 (Markdown)')).toHaveValue('## 바뀐 프롬프트');
    expect(screen.getByLabelText('저장 경로')).toHaveValue('/tmp/changed');
  });

  it('updates output path input when selecting folder', async () => {
    const bridge = createBridgeMock({
      chooseOutputPath: vi.fn(async () => '/tmp/selected-output'),
    });
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '설정' }));
    await waitFor(() => {
      expect(screen.getByLabelText('저장 경로')).toHaveValue('/tmp/blog-output');
    });

    fireEvent.click(screen.getByRole('button', { name: '경로 탐색' }));

    await waitFor(() => {
      expect(screen.getByLabelText('저장 경로')).toHaveValue('/tmp/selected-output');
    });
    expect(screen.getByText('저장 경로를 선택했습니다. 설정 저장을 눌러 적용해주세요.')).toBeInTheDocument();
  });

  it('keeps selected output path when delayed settings load resolves later', async () => {
    let resolveSettingsGet: ((value: { apiKeyMasked: string; promptMarkdown: string; outputPath: string }) => void) | undefined;
    const settingsGetPromise = new Promise<{ apiKeyMasked: string; promptMarkdown: string; outputPath: string }>((resolve) => {
      resolveSettingsGet = resolve;
    });
    const bridge = createBridgeMock({
      get: vi.fn(async () => settingsGetPromise),
      chooseOutputPath: vi.fn(async () => '/tmp/selected-output'),
    });
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '설정' }));

    fireEvent.click(screen.getByRole('button', { name: '경로 탐색' }));
    await waitFor(() => {
      expect(screen.getByLabelText('저장 경로')).toHaveValue('/tmp/selected-output');
    });

    resolveSettingsGet?.({
      apiKeyMasked: 'AIza****',
      promptMarkdown: '## 저장된 프롬프트',
      outputPath: '/tmp/blog-output',
    });

    await waitFor(() => {
      expect(screen.getByLabelText('저장 경로')).toHaveValue('/tmp/selected-output');
    });
  });

  it('saves selected output path without resetting it', async () => {
    const bridge = createStatefulBridgeMock({
      chooseOutputPath: vi.fn(async () => '/tmp/selected-output'),
    });
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '설정' }));
    await screen.findByLabelText('저장 경로');

    fireEvent.click(screen.getByRole('button', { name: '경로 탐색' }));
    await waitFor(() => {
      expect(screen.getByLabelText('저장 경로')).toHaveValue('/tmp/selected-output');
    });

    fireEvent.click(screen.getByRole('button', { name: '설정 저장' }));

    await waitFor(() => {
      expect(bridge.settings.update).toHaveBeenCalledWith({
        promptMarkdown: '## 저장된 프롬프트',
        outputPath: '/tmp/selected-output',
      });
      expect(screen.getByLabelText('저장 경로')).toHaveValue('/tmp/selected-output');
    });
  });

  it('shows notice when output path selection is canceled', async () => {
    const bridge = createBridgeMock({
      chooseOutputPath: vi.fn(async () => null),
    });
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '설정' }));
    await screen.findByLabelText('저장 경로');

    fireEvent.click(screen.getByRole('button', { name: '경로 탐색' }));

    expect(await screen.findByText('저장 경로 선택이 취소되었습니다.')).toBeInTheDocument();
  });

  it('shows error notice when output path selection fails', async () => {
    const bridge = createBridgeMock({
      chooseOutputPath: vi.fn(async () => {
        throw new Error('dialog failed');
      }),
    });
    (window as unknown as { bridge: BridgeMock }).bridge = bridge;

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '설정' }));
    await screen.findByLabelText('저장 경로');

    fireEvent.click(screen.getByRole('button', { name: '경로 탐색' }));

    expect(await screen.findByText('저장 경로 선택 창을 열지 못했습니다.')).toBeInTheDocument();
  });
});
