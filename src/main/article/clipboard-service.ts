import { convert } from '@jjlabsio/md-to-naver-blog';

type ClipboardWritePayload = {
  html?: string;
  text: string;
};

type ClipboardLike = {
  write: (payload: ClipboardWritePayload) => void;
  writeText: (text: string) => void;
};

type NaverConvertResult = {
  html: string;
  fallback: boolean;
};

type CreateClipboardServiceArgs = {
  clipboard: ClipboardLike;
  convertMarkdownToNaverHtml?: (markdown: string) => NaverConvertResult;
};

function normalizeMarkdown(markdown: string): string {
  const normalized = markdown.trim();
  if (!normalized) {
    throw new Error('복사할 본문이 비어 있습니다. 글을 생성하거나 문단을 선택한 뒤 다시 시도해주세요.');
  }
  return normalized;
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function fallbackHtml(markdown: string): string {
  return `<pre>${escapeHtml(markdown)}</pre>`;
}

function defaultConvertMarkdownToNaverHtml(markdown: string): NaverConvertResult {
  try {
    const result = convert(markdown);
    if (result.html.trim()) {
      return {
        html: result.html,
        fallback: false,
      };
    }
  } catch {
    // noop: fallback below
  }

  return {
    html: fallbackHtml(markdown),
    fallback: true,
  };
}

export function createClipboardService({ clipboard, convertMarkdownToNaverHtml = defaultConvertMarkdownToNaverHtml }: CreateClipboardServiceArgs) {
  const convertWithFallback = (markdown: string): NaverConvertResult => {
    try {
      return convertMarkdownToNaverHtml(markdown);
    } catch {
      return {
        html: fallbackHtml(markdown),
        fallback: true,
      };
    }
  };

  return {
    async copyNaver(markdown: string): Promise<{ ok: boolean }> {
      const normalized = normalizeMarkdown(markdown);
      const converted = convertWithFallback(normalized);
      clipboard.write({
        html: converted.html,
        text: normalized,
      });
      return { ok: true };
    },

    async copySelectionNaver(markdown: string): Promise<{ ok: boolean }> {
      const normalized = normalizeMarkdown(markdown);
      const converted = convertWithFallback(normalized);
      clipboard.write({
        html: converted.html,
        text: normalized,
      });
      return { ok: true };
    },

    async copyMarkdown(markdown: string): Promise<{ ok: boolean }> {
      const normalized = normalizeMarkdown(markdown);
      clipboard.writeText(normalized);
      return { ok: true };
    },
  };
}
