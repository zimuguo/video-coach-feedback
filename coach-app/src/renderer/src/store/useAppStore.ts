import { create } from 'zustand'
import { Comment, SummaryData, EMPTY_SUMMARY } from '../types'
import { v4 as uuidv4 } from 'uuid'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface AppState {
  // Video state
  videoPath: string | null
  videoUrl: string | null
  videoFilename: string | null
  videoDuration: number
  currentTime: number

  // File paths
  commentsPath: string | null
  summaryPath: string | null

  // Metadata
  coachName: string
  teacherName: string

  // Data
  comments: Comment[]
  summary: SummaryData

  // UI state
  selectedCommentId: string | null
  editingCommentId: string | null
  showCommentForm: boolean
  pendingCommentTimestamp: number | null
  statusMessage: string | null

  // Actions
  loadVideo: (
    path: string,
    url: string,
    filename: string,
    commentsPath: string,
    summaryPath: string
  ) => void
  setCurrentTime: (time: number) => void
  setVideoDuration: (duration: number) => void
  setCoachName: (name: string) => void
  setTeacherName: (name: string) => void

  openCommentForm: (timestamp: number) => void
  closeCommentForm: () => void
  addComment: (text: string) => Comment
  updateComment: (id: string, text: string) => Comment
  deleteComment: (id: string) => void
  selectComment: (id: string | null) => void
  setEditingComment: (id: string | null) => void

  updateSummary: (field: keyof SummaryData, value: string) => void
  setStatusMessage: (msg: string | null) => void

  getCommentsFile: () => object
  getSummaryFile: () => object
}

export const useAppStore = create<AppState>((set, get) => ({
  videoPath: null,
  videoUrl: null,
  videoFilename: null,
  videoDuration: 0,
  currentTime: 0,
  commentsPath: null,
  summaryPath: null,
  coachName: '',
  teacherName: '',
  comments: [],
  summary: { ...EMPTY_SUMMARY },
  selectedCommentId: null,
  editingCommentId: null,
  showCommentForm: false,
  pendingCommentTimestamp: null,
  statusMessage: null,

  loadVideo: (path, url, filename, commentsPath, summaryPath) =>
    set({
      videoPath: path,
      videoUrl: url,
      videoFilename: filename,
      commentsPath,
      summaryPath,
      comments: [],
      summary: { ...EMPTY_SUMMARY },
      selectedCommentId: null,
      editingCommentId: null,
      showCommentForm: false,
      currentTime: 0,
      videoDuration: 0
    }),

  setCurrentTime: (time) => set({ currentTime: time }),
  setVideoDuration: (duration) => set({ videoDuration: duration }),
  setCoachName: (name) => set({ coachName: name }),
  setTeacherName: (name) => set({ teacherName: name }),

  openCommentForm: (timestamp) =>
    set({
      showCommentForm: true,
      pendingCommentTimestamp: timestamp,
      editingCommentId: null
    }),

  closeCommentForm: () =>
    set({
      showCommentForm: false,
      pendingCommentTimestamp: null
    }),

  addComment: (text) => {
    const state = get()
    const timestamp = state.pendingCommentTimestamp ?? state.currentTime
    const comment: Comment = {
      id: uuidv4(),
      timestamp,
      timestampDisplay: formatTime(timestamp),
      text: text.trim(),
      createdAt: new Date().toISOString()
    }
    const comments = [...state.comments, comment].sort((a, b) => a.timestamp - b.timestamp)
    set({ comments, showCommentForm: false, pendingCommentTimestamp: null })
    return comment
  },

  updateComment: (id, text) => {
    const state = get()
    let updated!: Comment
    const comments = state.comments.map((c) => {
      if (c.id === id) {
        updated = { ...c, text: text.trim() }
        return updated
      }
      return c
    })
    set({ comments, editingCommentId: null })
    return updated
  },

  deleteComment: (id) =>
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== id),
      selectedCommentId: state.selectedCommentId === id ? null : state.selectedCommentId
    })),

  selectComment: (id) => set({ selectedCommentId: id }),
  setEditingComment: (id) => set({ editingCommentId: id }),

  updateSummary: (field, value) =>
    set((state) => ({
      summary: { ...state.summary, [field]: value }
    })),

  setStatusMessage: (msg) => set({ statusMessage: msg }),

  getCommentsFile: () => {
    const state = get()
    return {
      version: '1.0',
      videoFilename: state.videoFilename,
      createdAt: new Date().toISOString(),
      coachName: state.coachName,
      teacherName: state.teacherName,
      comments: state.comments
    }
  },

  getSummaryFile: () => {
    const state = get()
    return {
      version: '1.0',
      videoFilename: state.videoFilename,
      createdAt: new Date().toISOString(),
      coachName: state.coachName,
      teacherName: state.teacherName,
      summary: state.summary
    }
  }
}))
