import { contextBridge } from 'electron'

// Reservado para IPC futuro (save/load, system info, etc.)
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
})
