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

    const result = await service.copyNaver('# 제목\n\n*(사진 1)*\n\n본문\n\n***\n\n![사진](https://example.com/a.png)\n\n둘째 본문');

    expect(result).toEqual({ ok: true });
    expect(convertMarkdownToNaverHtml).toHaveBeenCalledWith('# 제목\n\n본문\n\n---\n\n둘째 본문');
    expect(clipboard.write).toHaveBeenCalledWith({
      html: '<p>본문</p>',
      text: '# 제목\n\n본문\n\n---\n\n둘째 본문',
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

    await service.copyMarkdown('# 제목\n\n*사진 1*\n\n본문');

    expect(clipboard.writeText).toHaveBeenCalledWith('# 제목\n\n본문');
  });

  it('flattens italic html from naver clipboard payload', async () => {
    const clipboard = {
      write: vi.fn(),
      writeText: vi.fn(),
    };
    const service = createClipboardService({
      clipboard,
      convertMarkdownToNaverHtml: vi.fn(() => ({
        html: '<p><em style="font-style: italic;">기울임</em> 본문</p>',
        fallback: false,
      })),
    });

    await service.copyNaver('본문 *강조*');

    expect(clipboard.write).toHaveBeenCalledWith({
      html: '<p>기울임 본문</p>',
      text: '본문 *강조*',
    });
  });

  it('limits italic flattening to html tags and style attributes', async () => {
    const clipboard = {
      write: vi.fn(),
      writeText: vi.fn(),
    };
    const service = createClipboardService({
      clipboard,
      convertMarkdownToNaverHtml: vi.fn(() => ({
        html: [
          '<p><em style="font-style: italic;">기울임</em></p>',
          '<p><i>아이 태그</i></p>',
          '<span style="font-style: italic; color: red;">스타일 본문</span>',
          '<pre>font-style: italic;</pre>',
        ].join(''),
        fallback: false,
      })),
    });

    await service.copyNaver('본문');

    expect(clipboard.write).toHaveBeenCalledWith({
      html: [
        '<p>기울임</p>',
        '<p>아이 태그</p>',
        '<span style="color: red">스타일 본문</span>',
        '<pre>font-style: italic;</pre>',
      ].join(''),
      text: '본문',
    });
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
