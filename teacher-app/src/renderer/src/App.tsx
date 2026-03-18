import React, { useState } from 'react'
import { useAppStore } from './store/useAppStore'
import VideoPlayer from './components/VideoPlayer'
import CommentPanel from './components/CommentPanel'
import SummaryTable from './components/SummaryTable'
import { CommentsFile, SummaryFile, EMPTY_SUMMARY } from './types'

export default function App() {
  const { videoUrl, loadData, coachName, teacherName, errorMessage, setErrorMessage } =
    useAppStore()
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

      const commentsResult = await window.electronAPI.readJson(paths.commentsPath)
      const summaryResult = await window.electronAPI.readJson(paths.summaryPath)

      let comments: CommentsFile['comments'] = []
      let summary = { ...EMPTY_SUMMARY }
      let resolvedCoachName = ''
      let resolvedTeacherName = ''
      const warnings: string[] = []

      if (commentsResult.success && commentsResult.data) {
        const data = commentsResult.data as CommentsFile
        comments = data.comments || []
        resolvedCoachName = data.coachName || ''
        resolvedTeacherName = data.teacherName || ''
      } else {
        warnings.push(
          'Comment file not found — make sure the video and the .comments.json file are in the same folder.'
        )
      }

      if (summaryResult.success && summaryResult.data) {
        const data = summaryResult.data as SummaryFile
        summary = { ...EMPTY_SUMMARY, ...data.summary }
        // Prefer coachName/teacherName from summary if not already set
        if (!resolvedCoachName) resolvedCoachName = data.coachName || ''
        if (!resolvedTeacherName) resolvedTeacherName = data.teacherName || ''
      } else {
        warnings.push(
          'Summary file not found — make sure the video and the .summary.json file are in the same folder.'
        )
      }

      loadData(filePath, url, filename, comments, summary, resolvedCoachName, resolvedTeacherName)

      if (warnings.length > 0) {
        setErrorMessage(warnings.join('\n'))
      }
    } catch (_err) {
      setErrorMessage('Could not load the video. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="font-semibold text-emerald-400">Video Coaching Feedback</span>
          <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded">TEACHER</span>
        </div>
        {(coachName || teacherName) && (
          <div className="text-sm text-slate-400">
            {teacherName && (
              <span>
                For: <span className="text-slate-200">{teacherName}</span>
              </span>
            )}
            {coachName && (
              <span className="ml-3">
                From: <span className="text-slate-200">{coachName}</span>
              </span>
            )}
          </div>
        )}
        <button
          onClick={handleLoadVideo}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
        >
          {loading ? 'Loading...' : videoUrl ? 'Load Different Video' : 'Load Video'}
        </button>
      </header>

      {/* Error/warning message */}
      {errorMessage && (
        <div className="px-4 py-2 bg-amber-900/40 border-b border-amber-800 text-amber-200 text-sm whitespace-pre-line">
          {errorMessage}
          <button
            onClick={() => setErrorMessage(null)}
            className="ml-3 text-amber-400 hover:text-amber-200"
          >
            ✕
          </button>
        </div>
      )}

      {!videoUrl ? (
        /* Welcome screen */
        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center p-8">
          <div className="text-6xl">📋</div>
          <h1 className="text-2xl font-bold text-slate-200">Video Coaching Feedback</h1>
          <p className="text-slate-400 max-w-md">
            Open the folder you received from your coach, then load the video file. Comments and
            the summary table will load automatically.
          </p>
          <div className="bg-slate-800 rounded-lg p-4 text-left text-sm text-slate-400 max-w-md">
            <p className="font-medium text-slate-300 mb-2">Getting started:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Extract (unzip) the file your coach sent you</li>
              <li>Click "Load Video" and select the video file</li>
              <li>Comments and feedback will load automatically</li>
            </ol>
          </div>
          <button
            onClick={handleLoadVideo}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            {loading ? 'Loading...' : 'Load Video'}
          </button>
        </div>
      ) : (
        /* Main layout */
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Video */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <VideoPlayer />
          </div>

          {/* Right: Comments / Summary panel */}
          <div className="w-96 shrink-0 flex flex-col border-l border-slate-700">
            {/* Tab switcher */}
            <div className="flex border-b border-slate-700 shrink-0">
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === 'comments'
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Comments
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === 'summary'
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Summary Table
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {activeTab === 'comments' ? <CommentPanel /> : <SummaryTable />}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
