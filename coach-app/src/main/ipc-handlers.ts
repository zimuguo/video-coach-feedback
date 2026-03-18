import { ipcMain, dialog, app } from 'electron'
import { readFileSync, writeFileSync, existsSync, createWriteStream } from 'fs'
import { join, dirname, basename, extname } from 'path'
import archiver from 'archiver'

export function registerIpcHandlers(): void {
  // Open video file dialog
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

  // Convert file path to localfile:// URL
  ipcMain.handle('file:toUrl', (_event, filePath: string) => {
    const normalized = filePath.replace(/\\/g, '/')
    return `localfile:///${normalized}`
  })

  // Save comments JSON file
  ipcMain.handle('file:saveComments', (_event, filePath: string, data: unknown) => {
    try {
      writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Save summary JSON file
  ipcMain.handle('file:saveSummary', (_event, filePath: string, data: unknown) => {
    try {
      writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Read JSON file
  ipcMain.handle('file:readJson', (_event, filePath: string) => {
    try {
      if (!existsSync(filePath)) return { success: false, error: 'File not found' }
      const content = readFileSync(filePath, 'utf-8')
      return { success: true, data: JSON.parse(content) }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Get derived JSON file paths from video path
  ipcMain.handle('file:getJsonPaths', (_event, videoPath: string) => {
    const dir = dirname(videoPath)
    const base = basename(videoPath, extname(videoPath))
    return {
      commentsPath: join(dir, `${base}.comments.json`),
      summaryPath: join(dir, `${base}.summary.json`)
    }
  })

  // Export package as ZIP
  ipcMain.handle(
    'file:exportPackage',
    async (_event, videoPath: string, commentsPath: string, summaryPath: string) => {
      const base = basename(videoPath, extname(videoPath))
      const defaultPath = join(dirname(videoPath), `${base}_feedback.zip`)

      const result = await dialog.showSaveDialog({
        title: 'Save Feedback Package',
        defaultPath,
        filters: [{ name: 'ZIP Archive', extensions: ['zip'] }]
      })

      if (result.canceled || !result.filePath) return { success: false, error: 'Cancelled' }

      return new Promise<{ success: boolean; error?: string; filePath?: string }>((resolve) => {
        const output = createWriteStream(result.filePath!)
        const archive = archiver('zip', { zlib: { level: 1 } })

        output.on('close', () => resolve({ success: true, filePath: result.filePath }))
        archive.on('error', (err) => resolve({ success: false, error: err.message }))

        archive.pipe(output)

        archive.file(videoPath, { name: basename(videoPath) })
        if (existsSync(commentsPath)) archive.file(commentsPath, { name: basename(commentsPath) })
        if (existsSync(summaryPath)) archive.file(summaryPath, { name: basename(summaryPath) })

        archive.finalize()
      })
    }
  )

  // Get documents path for default save location
  ipcMain.handle('app:getDocumentsPath', () => {
    return app.getPath('documents')
  })
}
