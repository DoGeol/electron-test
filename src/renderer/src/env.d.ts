/// <reference types="vite/client" />

import type { BridgeApi } from '../../preload/bridge';

declare global {
  interface Window {
    bridge: BridgeApi;
  }
}

export {};
