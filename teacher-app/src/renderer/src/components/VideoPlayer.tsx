import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useAppStore } from '../store/useAppStore'

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const seekBarRef = useRef<HTMLDivElement>(null)
  const {
    videoUrl,
    currentTime,
    videoDuration,
    comments,
    selectedCommentId,
    seekToTime,
    setCurrentTime,
    setVideoDuration,
    selectComment,
    clearSeek
  } = useAppStore()

  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null)

  // Load video when URL changes
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return
    video.src = videoUrl
    video.load()
    setIsPlaying(false)
  }, [videoUrl])

  // Handle seek requests from the comment panel
  useEffect(() => {
    if (seekToTime === null) return
    const video = videoRef.current
    if (!video) return
    video.currentTime = seekToTime
    clearSeek()
  }, [seekToTime, clearSeek])

  // Auto-highlight the nearest comment as video plays
  useEffect(() => {
    if (comments.length === 0) return
    const active = [...comments]
      .filter((c) => Math.abs(c.timestamp - currentTime) < 2)
      .sort(
        (a, b) => Math.abs(a.timestamp - currentTime) - Math.abs(b.timestamp - currentTime)
      )[0]
    if (active && active.id !== selectedCommentId) {
      selectComment(active.id)
    }
  }, [currentTime, comments])

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    setCurrentTime(video.currentTime)
  }, [setCurrentTime])

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    setVideoDuration(video.duration)
  }, [setVideoDuration])

  const handlePlayPause = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const isDragging = useRef(false)

  const seekToClientX = useCallback((clientX: number) => {
    const video = videoRef.current
    const bar = seekBarRef.current
    if (!video || !bar) return
    const duration = video.duration
    if (!isFinite(duration) || duration === 0) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    video.currentTime = ratio * duration
  }, [])

  const handleSeekMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    isDragging.current = true
    seekToClientX(e.clientX)
  }

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      e.preventDefault()
      seekToClientX(e.clientX)
    }
    const onMouseUp = () => {
      isDragging.current = false
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const handleStepBack = () => {
    const video = videoRef.current
    if (!video) return
    const prev = comments
      .filter((c) => c.timestamp < currentTime - 0.1)
      .sort((a, b) => b.timestamp - a.timestamp)[0]
    if (prev) {
      video.currentTime = prev.timestamp
      video.pause()
      setIsPlaying(false)
    }
  }

  const handleStepForward = () => {
    const video = videoRef.current
    if (!video) return
    const next = comments
      .filter((c) => c.timestamp > currentTime + 0.1)
      .sort((a, b) => a.timestamp - b.timestamp)[0]
    if (next) {
      video.currentTime = next.timestamp
      video.pause()
      setIsPlaying(false)
    }
  }

  const handleMarkerClick = (
    e: React.MouseEvent,
    commentId: string,
    timestamp: number
  ) => {
    e.stopPropagation()
    const video = videoRef.current
    if (video) video.currentTime = timestamp
    selectComment(commentId)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    if (videoRef.current) videoRef.current.volume = v
  }

  const progressPercent = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Video */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden min-h-0">
        <video
          ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="max-w-full max-h-full"
          playsInline
        />
      </div>

      {/* Controls */}
      <div className="bg-slate-900 px-4 py-3 shrink-0">
        {/* Seek bar with markers */}
        <div
          ref={seekBarRef}
          className="seek-bar-container mb-2"
          onMouseDown={handleSeekMouseDown}
        >
          <div className="seek-bar-track">
            <div className="seek-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          {/* Timestamp markers */}
          {videoDuration > 0 &&
            comments.map((comment) => {
              const leftPercent = (comment.timestamp / videoDuration) * 100
              const isActive = comment.id === selectedCommentId
              const isHovered = comment.id === hoveredMarkerId
              return (
                <div
                  key={comment.id}
                  className={`timestamp-marker ${isActive ? 'active' : ''}`}
                  style={{ left: `${leftPercent}%` }}
                  onClick={(e) => handleMarkerClick(e, comment.id, comment.timestamp)}
                  onMouseEnter={() => setHoveredMarkerId(comment.id)}
                  onMouseLeave={() => setHoveredMarkerId(null)}
                  title={`${comment.timestampDisplay}: ${comment.text}`}
                >
                  {(isHovered || isActive) && (
                    <div className="timestamp-marker-tooltip">
                      <div className="text-amber-400 text-sm font-mono mb-1">
                        {comment.timestampDisplay}
                      </div>
                      <div
                        className="text-slate-200 text-sm leading-snug"
                        style={{ maxWidth: '200px', wordBreak: 'break-word' }}
                      >
                        {comment.text.length > 40
                          ? comment.text.slice(0, 40) + '...'
                          : comment.text}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

          <div className="seek-bar-thumb" style={{ left: `${progressPercent}%` }} />
        </div>

        {/* Legend */}
        {comments.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <div className="w-2 h-3 bg-amber-500 rounded-sm"></div>
            <span>
              {comments.length} comment{comments.length !== 1 ? 's' : ''} — click a marker to
              jump to that moment
            </span>
          </div>
        )}

        {/* Button row */}
        <div className="flex items-center gap-3">
          {/* Step back */}
          <button
            onClick={handleStepBack}
            disabled={comments.filter((c) => c.timestamp < currentTime - 0.1).length === 0}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-100 disabled:opacity-30 transition-colors shrink-0"
            title="Previous comment"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={handlePlayPause}
            className="w-10 h-10 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 rounded-full text-white transition-colors shrink-0"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>

          {/* Step forward */}
          <button
            onClick={handleStepForward}
            disabled={comments.filter((c) => c.timestamp > currentTime + 0.1).length === 0}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-100 disabled:opacity-30 transition-colors shrink-0"
            title="Next comment"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18 14.5 12 6 6v12zm2.5-6 8.5 6V6l-8.5 6zM16 6h2v12h-2z" />
            </svg>
          </button>

          <span className="text-sm font-mono text-slate-300 shrink-0">
            {formatTime(currentTime)} / {formatTime(videoDuration)}
          </span>

          <div className="flex items-center gap-2 ml-2">
            <svg
              className="w-4 h-4 text-slate-400 shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 accent-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
