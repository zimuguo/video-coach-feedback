import { create } from 'zustand'
import { Comment, SummaryData, EMPTY_SUMMARY } from '../types'

interface AppState {
  videoPath: string | null
  videoUrl: string | null
  videoFilename: string | null
  videoDuration: number
  currentTime: number
  coachName: string
  teacherName: string
  comments: Comment[]
  summary: SummaryData
  selectedCommentId: string | null
  seekToTime: number | null
  errorMessage: string | null

  loadData: (
    videoPath: string,
    videoUrl: string,
    videoFilename: string,
    comments: Comment[],
    summary: SummaryData,
    coachName: string,
    teacherName: string
  ) => void
  setCurrentTime: (time: number) => void
  setVideoDuration: (duration: number) => void
  selectComment: (id: string | null) => void
  triggerSeek: (time: number) => void
  clearSeek: () => void
  setErrorMessage: (msg: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  videoPath: null,
  videoUrl: null,
  videoFilename: null,
  videoDuration: 0,
  currentTime: 0,
  coachName: '',
  teacherName: '',
  comments: [],
  summary: { ...EMPTY_SUMMARY },
  selectedCommentId: null,
  seekToTime: null,
  errorMessage: null,

  loadData: (videoPath, videoUrl, videoFilename, comments, summary, coachName, teacherName) =>
    set({
      videoPath,
      videoUrl,
      videoFilename,
      comments,
      summary,
      coachName,
      teacherName,
      selectedCommentId: null,
      seekToTime: null,
      currentTime: 0,
      videoDuration: 0
    }),

  setCurrentTime: (time) => set({ currentTime: time }),
  setVideoDuration: (duration) => set({ videoDuration: duration }),
  selectComment: (id) => set({ selectedCommentId: id }),
  triggerSeek: (time) => set({ seekToTime: time }),
  clearSeek: () => set({ seekToTime: null }),
  setErrorMessage: (msg) => set({ errorMessage: msg })
}))
