import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openVideoDialog: () => ipcRenderer.invoke('dialog:openVideo'),
  fileToUrl: (filePath: string) => ipcRenderer.invoke('file:toUrl', filePath),
  saveComments: (filePath: string, data: unknown) =>
    ipcRenderer.invoke('file:saveComments', filePath, data),
  saveSummary: (filePath: string, data: unknown) =>
    ipcRenderer.invoke('file:saveSummary', filePath, data),
  readJson: (filePath: string) => ipcRenderer.invoke('file:readJson', filePath),
  getJsonPaths: (videoPath: string) => ipcRenderer.invoke('file:getJsonPaths', videoPath),
  exportPackage: (videoPath: string, commentsPath: string, summaryPath: string) =>
    ipcRenderer.invoke('file:exportPackage', videoPath, commentsPath, summaryPath),
  getDocumentsPath: () => ipcRenderer.invoke('app:getDocumentsPath')
})
