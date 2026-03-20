import React, { useState } from 'react'
import { useAppStore } from '../store/useAppStore'

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function CommentPanel() {
  const {
    comments,
    showCommentForm,
    pendingCommentTimestamp,
    editingCommentId,
    commentsPath,
    addComment,
    updateComment,
    deleteComment,
    closeCommentForm,
    setEditingComment,
    setStatusMessage,
    selectComment,
    triggerSeek
  } = useAppStore()

  const [commentText, setCommentText] = useState('')
  const [editText, setEditText] = useState('')

  const handleSaveComment = async () => {
    if (!commentText.trim()) return
    const comment = addComment(commentText)
    setCommentText('')

    if (commentsPath) {
      const data = useAppStore.getState().getCommentsFile()
      await window.electronAPI.saveComments(commentsPath, data)
    }
    setStatusMessage(`Comment saved at ${comment.timestampDisplay}`)
    setTimeout(() => useAppStore.getState().setStatusMessage(null), 3000)
  }

  const handleStartEdit = (id: string, currentText: string) => {
    setEditingComment(id)
    setEditText(currentText)
  }

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) return
    updateComment(id, editText)
    setEditingComment(null)

    if (commentsPath) {
      const data = useAppStore.getState().getCommentsFile()
      await window.electronAPI.saveComments(commentsPath, data)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment?')) return
    deleteComment(id)

    if (commentsPath) {
      const data = useAppStore.getState().getCommentsFile()
      await window.electronAPI.saveComments(commentsPath, data)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Comment form */}
      {showCommentForm && (
        <div className="p-3 border-b border-slate-700 bg-amber-900/20 shrink-0">
          <div className="text-xs text-amber-400 font-medium mb-2">
            Adding comment at {formatTime(pendingCommentTimestamp ?? 0)}
          </div>
          <textarea
            autoFocus
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Type your feedback here (1-2 sentences)..."
            className="w-full bg-slate-800 border border-amber-500 rounded p-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
            rows={3}
            maxLength={500}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSaveComment()
              if (e.key === 'Escape') {
                closeCommentForm()
                setCommentText('')
              }
            }}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-slate-500">
              {commentText.length}/500 · Ctrl+Enter to save
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  closeCommentForm()
                  setCommentText('')
                }}
                className="px-3 py-1 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveComment}
                disabled={!commentText.trim()}
                className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded transition-colors"
              >
                Save Comment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">
            <div className="text-3xl mb-3">💬</div>
            <p>No comments yet.</p>
            <p className="mt-1">Pause the video and click "Add Comment" to begin.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-3 hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => {
                  selectComment(comment.id)
                  triggerSeek(comment.timestamp)
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-mono bg-blue-900 text-blue-300 px-2 py-0.5 rounded shrink-0">
                    {comment.timestampDisplay}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEdit(comment.id, comment.text)}
                      className="p-1 text-slate-500 hover:text-slate-200 transition-colors"
                      title="Edit comment"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete comment"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                {editingCommentId === comment.id ? (
                  <div className="mt-2">
                    <textarea
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full bg-slate-700 border border-blue-500 rounded p-2 text-sm text-slate-100 focus:outline-none resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="flex gap-2 mt-1 justify-end">
                      <button
                        onClick={() => setEditingComment(null)}
                        className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(comment.id)}
                        className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-slate-300 leading-relaxed">{comment.text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
