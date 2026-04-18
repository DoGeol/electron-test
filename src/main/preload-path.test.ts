// @vitest-environment node

import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PRELOAD_ENTRY_FILE, resolvePreloadPath } from './preload-path';

describe('resolvePreloadPath', () => {
  it('uses mjs preload entry filename', () => {
    expect(PRELOAD_ENTRY_FILE).toBe('index.mjs');
  });

  it('resolves preload path from main output directory', () => {
    const mainDirname = join('/tmp', 'app', 'out', 'main');
    expect(resolvePreloadPath(mainDirname)).toBe(join('/tmp', 'app', 'out', 'preload', 'index.mjs'));
  });
});
