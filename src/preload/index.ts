import { contextBridge, ipcRenderer } from 'electron';
import { createBridgeApi } from './bridge';

const bridge = createBridgeApi(ipcRenderer);

contextBridge.exposeInMainWorld('bridge', bridge);
