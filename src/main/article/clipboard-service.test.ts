// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import { createClipboardService } from './clipboard-service';

describe('createClipboardService', () => {
  it('copies naver html and plain markdown into clipboard payload', async () => {
    const clipboard = {
      write: vi.fn(),
      writeText: vi.fn(),
    };
    const convertMarkdownToNaverHtml = vi.fn(() => ({
      html: '<p>본문</p>',
      fallback: false,
    }));

    const service = createClipboardService({
      clipboard,
      convertMarkdownToNaverHtml,
    });

    const result = await service.copyNaver('# 제목\n\n본문');

    expect(result).toEqual({ ok: true });
    expect(convertMarkdownToNaverHtml).toHaveBeenCalledWith('# 제목\n\n본문');
    expect(clipboard.write).toHaveBeenCalledWith({
      html: '<p>본문</p>',
      text: '# 제목\n\n본문',
    });
  });

  it('copies markdown text using plain text clipboard API', async () => {
    const clipboard = {
      write: vi.fn(),
      writeText: vi.fn(),
    };
    const service = createClipboardService({
      clipboard,
      convertMarkdownToNaverHtml: vi.fn(() => ({
        html: '<p>본문</p>',
        fallback: false,
      })),
    });

    await service.copyMarkdown('# 제목\n\n본문');

    expect(clipboard.writeText).toHaveBeenCalledWith('# 제목\n\n본문');
  });

  it('falls back to escaped pre html when converter throws', async () => {
    const clipboard = {
      write: vi.fn(),
      writeText: vi.fn(),
    };
    const service = createClipboardService({
      clipboard,
      convertMarkdownToNaverHtml: vi.fn(() => {
        throw new Error('convert failed');
      }),
    });

    await service.copySelectionNaver('# 제목 <태그>');

    expect(clipboard.write).toHaveBeenCalledWith({
      html: '<pre># 제목 &lt;태그&gt;</pre>',
      text: '# 제목 <태그>',
    });
  });

  it('throws recoverable message when markdown is empty', async () => {
    const service = createClipboardService({
      clipboard: {
        write: vi.fn(),
        writeText: vi.fn(),
      },
      convertMarkdownToNaverHtml: vi.fn(() => ({
        html: '<p></p>',
        fallback: false,
      })),
    });

    await expect(service.copyNaver('   ')).rejects.toThrow('복사할 본문이 비어 있습니다.');
  });
});
