import React, { useState } from 'react'

declare const __APP_VERSION__: string
declare const __GIT_COMMIT__: string
import { useAppStore } from './store/useAppStore'
import { CommentsFile, SummaryFile, EMPTY_SUMMARY } from './types'
import VideoPlayer from './components/VideoPlayer'
import CommentPanel from './components/CommentPanel'
import SummaryTable from './components/SummaryTable'
import ExportButton from './components/ExportButton'

export default function App() {
  const {
    videoUrl,
    loadVideo,
    coachName,
    teacherName,
    setCoachName,
    setTeacherName,
    statusMessage,
    setStatusMessage
  } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'comments' | 'summary'>('comments')

  const handleLoadVideo = async () => {
    setLoading(true)
    try {
      const filePath = await window.electronAPI.openVideoDialog()
      if (!filePath) return

      const url = await window.electronAPI.fileToUrl(filePath)
      const paths = await window.electronAPI.getJsonPaths(filePath)
      const filename = filePath.split(/[\\/]/).pop() || filePath

      // Restore any previously saved work for this video
      const [commentsResult, summaryResult] = await Promise.all([
        window.electronAPI.readJson(paths.commentsPath),
        window.electronAPI.readJson(paths.summaryPath)
      ])

      let existingComments: CommentsFile['comments'] | undefined
      let existingSummary: typeof EMPTY_SUMMARY | undefined
      let existingCoachName: string | undefined
      let existingTeacherName: string | undefined
      let restored = false

      if (commentsResult.success && commentsResult.data) {
        const data = commentsResult.data as CommentsFile
        existingComments = data.comments ?? []
        existingCoachName = data.coachName || undefined
        existingTeacherName = data.teacherName || undefined
        if (existingComments.length > 0) restored = true
      }

      if (summaryResult.success && summaryResult.data) {
        const data = summaryResult.data as SummaryFile
        existingSummary = { ...EMPTY_SUMMARY, ...data.summary }
      }

      loadVideo(filePath, url, filename, paths.commentsPath, paths.summaryPath,
        existingComments, existingSummary, existingCoachName, existingTeacherName)

      setStatusMessage(
        restored
          ? `Video loaded. Restored ${existingComments!.length} comment${existingComments!.length !== 1 ? 's' : ''} from previous session.`
          : 'Video loaded. Watch and pause to add comments.'
      )
    } catch (_err) {
      setStatusMessage('Could not load the video. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 relative">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="font-semibold text-blue-400">Video Coaching Feedback</span>
          <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded">COACH</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <label className="text-slate-400">Coach:</label>
          <input
            type="text"
            value={coachName}
            onChange={(e) => setCoachName(e.target.value)}
            placeholder="Your name"
            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm w-36 focus:outline-none focus:border-blue-500"
          />
          <label className="text-slate-400">Teacher:</label>
          <input
            type="text"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            placeholder="Teacher's name"
            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm w-36 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadVideo}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
          >
            {loading ? 'Loading...' : videoUrl ? 'Load Different Video' : 'Load Video'}
          </button>
          {videoUrl && <ExportButton />}
        </div>
      </header>

      {/* Status message */}
      {statusMessage && (
        <div className="px-4 py-2 bg-blue-900/50 border-b border-blue-800 text-blue-200 text-sm">
          {statusMessage}
          <button
            onClick={() => setStatusMessage(null)}
            className="ml-3 text-blue-400 hover:text-blue-200"
          >
            ✕
          </button>
        </div>
      )}

      {!videoUrl ? (
        /* Welcome screen */
        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center p-8">
          <div className="text-6xl">🎬</div>
          <h1 className="text-2xl font-bold text-slate-200">Video Coaching Feedback Tool</h1>
          <p className="text-slate-400 max-w-md">
            Load a video to get started. You can pause the video at any moment to add timestamped
            feedback comments for the teacher.
          </p>
          <button
            onClick={handleLoadVideo}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            {loading ? 'Loading...' : 'Load Video to Begin'}
          </button>
        </div>
      ) : (
        /* Main layout */
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Video + controls */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <VideoPlayer />
          </div>

          {/* Right: Comments / Summary panel */}
          <div className="w-96 shrink-0 flex flex-col border-l border-slate-700 bg-slate-900">
            {/* Tab switcher */}
            <div className="flex border-b border-slate-700 shrink-0">
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === 'comments'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Comments
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === 'summary'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Statistics
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {activeTab === 'comments' ? <CommentPanel /> : <SummaryTable mode="edit" />}
            </div>
          </div>
        </div>
      )}
      <div className="absolute bottom-2 right-3 text-xs text-slate-600 pointer-events-none select-none">
        v{__APP_VERSION__} ({__GIT_COMMIT__})
      </div>
    </div>
  )
}
