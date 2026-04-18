import { contextBridge, ipcRenderer, webUtils } from 'electron';
import { createBridgeApi } from './bridge';

const bridge = createBridgeApi(ipcRenderer, webUtils);

contextBridge.exposeInMainWorld('bridge', bridge);
