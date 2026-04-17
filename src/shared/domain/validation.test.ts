// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { validateImageFile } from './validation';

type ImageLike = {
  name: string;
  size: number;
  type: string;
};

const createImage = (overrides: Partial<ImageLike>): ImageLike => ({
  name: 'sample.png',
  size: 1024,
  type: 'image/png',
  ...overrides,
});

describe('validateImageFile', () => {
  it('accepts a valid png image', () => {
    const file = createImage({ name: 'cover.png', type: 'image/png' });
    const result = validateImageFile(file);
    expect(result).toEqual({ ok: true });
  });

  it('accepts uppercase extension when MIME type is valid', () => {
    const file = createImage({ name: 'PHOTO.JPEG', type: 'image/jpeg' });
    const result = validateImageFile(file);
    expect(result).toEqual({ ok: true });
  });

  it('rejects empty file', () => {
    const file = createImage({ name: 'empty.webp', type: 'image/webp', size: 0 });
    const result = validateImageFile(file);
    expect(result).toMatchObject({ ok: false, code: 'EMPTY_FILE' });
  });

  it('rejects unsupported extension', () => {
    const file = createImage({ name: 'clip.gif', type: 'image/gif' });
    const result = validateImageFile(file);
    expect(result).toMatchObject({ ok: false, code: 'INVALID_EXTENSION' });
  });

  it('rejects unsupported MIME type', () => {
    const file = createImage({ name: 'cover.png', type: 'application/pdf' });
    const result = validateImageFile(file);
    expect(result).toMatchObject({ ok: false, code: 'INVALID_MIME_TYPE' });
  });
});
