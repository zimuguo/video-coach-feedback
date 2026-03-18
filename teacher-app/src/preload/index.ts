import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openVideoDialog: () => ipcRenderer.invoke('dialog:openVideo'),
  fileToUrl: (filePath: string) => ipcRenderer.invoke('file:toUrl', filePath),
  readJson: (filePath: string) => ipcRenderer.invoke('file:readJson', filePath),
  getJsonPaths: (videoPath: string) => ipcRenderer.invoke('file:getJsonPaths', videoPath),
  checkExists: (filePath: string) => ipcRenderer.invoke('file:checkExists', filePath)
})
