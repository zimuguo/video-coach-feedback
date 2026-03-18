import React, { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'

export default function CommentPanel() {
  const { comments, selectedCommentId, selectComment, triggerSeek } = useAppStore()
  const selectedRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to selected comment
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedCommentId])

  const handleCommentClick = (id: string, timestamp: number) => {
    selectComment(id)
    triggerSeek(timestamp)
  }

  if (comments.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm h-full flex flex-col items-center justify-center">
        <div className="text-3xl mb-3">💬</div>
        <p>No comments were found.</p>
        <p className="mt-2 text-xs leading-relaxed">
          Make sure the video and the .comments.json file are in the same folder.
        </p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto divide-y divide-slate-800">
      {comments.map((comment) => {
        const isSelected = comment.id === selectedCommentId
        return (
          <div
            key={comment.id}
            ref={isSelected ? selectedRef : null}
            onClick={() => handleCommentClick(comment.id, comment.timestamp)}
            className={`p-3 cursor-pointer transition-colors ${
              isSelected
                ? 'bg-emerald-900/30 border-l-2 border-emerald-500'
                : 'hover:bg-slate-800/50 border-l-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded ${
                  isSelected ? 'bg-emerald-800 text-emerald-300' : 'bg-slate-700 text-slate-400'
                }`}
              >
                {comment.timestampDisplay}
              </span>
              {isSelected && <span className="text-xs text-emerald-500">▶ playing</span>}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{comment.text}</p>
          </div>
        )
      })}
    </div>
  )
}
