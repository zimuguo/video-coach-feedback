import { app, BrowserWindow, protocol, net } from 'electron'
import { join } from 'path'
import { pathToFileURL } from 'url'
import { ipcMain, dialog } from 'electron'
import { readFileSync, existsSync } from 'fs'
import { dirname, basename, extname, join as pathJoin } from 'path'

function registerIpcHandlers() {
  ipcMain.handle('dialog:openVideo', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Select Video File',
      properties: ['openFile'],
      filters: [
        { name: 'Video Files', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle('file:toUrl', (_event, filePath: string) => {
    const normalized = filePath.replace(/\\/g, '/')
    return `localfile:///${normalized}`
  })

  ipcMain.handle('file:readJson', (_event, filePath: string) => {
    try {
      if (!existsSync(filePath)) return { success: false, error: 'File not found' }
      const content = readFileSync(filePath, 'utf-8')
      return { success: true, data: JSON.parse(content) }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('file:getJsonPaths', (_event, videoPath: string) => {
    const dir = dirname(videoPath)
    const base = basename(videoPath, extname(videoPath))
    return {
      commentsPath: pathJoin(dir, `${base}.comments.json`),
      summaryPath: pathJoin(dir, `${base}.summary.json`)
    }
  })

  ipcMain.handle('file:checkExists', (_event, filePath: string) => {
    return existsSync(filePath)
  })
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'localfile',
    privileges: {
      secure: true,
      supportFetchAPI: true,
      stream: true,
      bypassCSP: true
    }
  }
])

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'Video Coaching Feedback - Teacher',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  protocol.handle('localfile', (request) => {
    const filePath = decodeURIComponent(request.url.slice('localfile:///'.length))
    return net.fetch(pathToFileURL(filePath).toString())
  })

  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
