// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { interpolatePrompt } from './prompt';

describe('interpolatePrompt', () => {
  it('replaces all supported tokens including repeated tokens', () => {
    const template = [
      '# {{topic}}',
      'Image context: {{image_context}}',
      'Style: {{style}}',
      'Format rules: {{format_rules}}',
      'Topic repeat: {{topic}}',
    ].join('\n');

    const result = interpolatePrompt(template, {
      topic: '봄 제주 여행 가이드',
      image_context: '해안 도로와 석양 사진',
      style: '친근하고 실용적인 톤',
      format_rules: 'Markdown 제목 + 짧은 문단 + 불릿',
    });

    expect(result).toContain('# 봄 제주 여행 가이드');
    expect(result).toContain('Image context: 해안 도로와 석양 사진');
    expect(result).toContain('Style: 친근하고 실용적인 톤');
    expect(result).toContain('Format rules: Markdown 제목 + 짧은 문단 + 불릿');
    expect(result).not.toContain('{{topic}}');
    expect(result).not.toContain('{{image_context}}');
    expect(result).not.toContain('{{style}}');
    expect(result).not.toContain('{{format_rules}}');
  });

  it('keeps unknown tokens unchanged', () => {
    const template = 'Known={{topic}}, Unknown={{audience}}';
    const result = interpolatePrompt(template, {
      topic: 'AI 글쓰기 워크플로우',
      image_context: '',
      style: '',
      format_rules: '',
    });

    expect(result).toBe('Known=AI 글쓰기 워크플로우, Unknown={{audience}}');
  });
});
