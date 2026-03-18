import React, { useState } from 'react'
import { useAppStore } from '../store/useAppStore'

export default function ExportButton() {
  const { videoPath, commentsPath, summaryPath, comments, setStatusMessage, getSummaryFile, getCommentsFile } =
    useAppStore()
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (!videoPath || !commentsPath || !summaryPath) return

    setExporting(true)
    try {
      // Save latest comments and summary before exporting
      const commentsData = getCommentsFile()
      const summaryData = getSummaryFile()
      await window.electronAPI.saveComments(commentsPath, commentsData)
      await window.electronAPI.saveSummary(summaryPath, summaryData)

      const result = await window.electronAPI.exportPackage(videoPath, commentsPath, summaryPath)
      if (result.success) {
        setStatusMessage(
          `Package exported! Share the ZIP file with the teacher: ${result.filePath}`
        )
      } else if (result.error !== 'Cancelled') {
        setStatusMessage(`Export failed: ${result.error}`)
      }
    } catch (_err) {
      setStatusMessage('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting || !videoPath}
      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2"
      title="Export video + comments + summary as a ZIP file to share with the teacher"
    >
      {exporting ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Exporting...
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export Package ({comments.length} comment{comments.length !== 1 ? 's' : ''})
        </>
      )}
    </button>
  )
}
