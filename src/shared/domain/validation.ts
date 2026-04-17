export type ImageValidationResult =
  | { ok: true }
  | { ok: false; code: 'INVALID_FILE' | 'EMPTY_FILE' | 'INVALID_EXTENSION' | 'INVALID_MIME_TYPE'; message: string };

export type ImageLike = {
  name: string;
  size: number;
  type: string;
};

const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp']);
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

function getExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot < 0 || lastDot === fileName.length - 1) {
    return '';
  }

  return fileName.slice(lastDot + 1).toLowerCase();
}

export function validateImageFile(file: ImageLike | null | undefined): ImageValidationResult {
  if (!file || typeof file.name !== 'string' || typeof file.size !== 'number' || typeof file.type !== 'string') {
    return { ok: false, code: 'INVALID_FILE', message: '유효한 파일 형식이 아닙니다.' };
  }

  if (file.size <= 0) {
    return { ok: false, code: 'EMPTY_FILE', message: '빈 파일은 업로드할 수 없습니다.' };
  }

  const extension = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return { ok: false, code: 'INVALID_EXTENSION', message: '지원하지 않는 확장자입니다.' };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    return { ok: false, code: 'INVALID_MIME_TYPE', message: '지원하지 않는 MIME type입니다.' };
  }

  return { ok: true };
}
