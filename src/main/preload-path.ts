import { join } from 'node:path';

export const PRELOAD_ENTRY_FILE = 'index.mjs';

export function resolvePreloadPath(mainDirname: string): string {
  return join(mainDirname, `../preload/${PRELOAD_ENTRY_FILE}`);
}
