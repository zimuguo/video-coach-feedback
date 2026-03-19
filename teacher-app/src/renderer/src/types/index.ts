export interface Comment {
  id: string
  timestamp: number
  timestampDisplay: string
  text: string
  createdAt: string
}

export interface BarItem {
  label: string
  count: number
}

export interface SummaryData {
  barChart1: BarItem[]
  barChart2: BarItem[]
  barChart1Comment: string
  barChart2Comment: string
}

export interface CommentsFile {
  version: string
  appVersion?: string
  appCommit?: string
  videoFilename: string
  createdAt: string
  coachName: string
  teacherName: string
  comments: Comment[]
}

export interface SummaryFile {
  version: string
  appVersion?: string
  appCommit?: string
  videoFilename: string
  createdAt: string
  coachName: string
  teacherName: string
  summary: SummaryData
}

export const EMPTY_SUMMARY: SummaryData = {
  barChart1: Array(5)
    .fill(null)
    .map(() => ({ label: '', count: 0 })),
  barChart2: Array(5)
    .fill(null)
    .map(() => ({ label: '', count: 0 })),
  barChart1Comment: '',
  barChart2Comment: ''
}

declare global {
  interface Window {
    electronAPI: {
      openVideoDialog: () => Promise<string | null>
      fileToUrl: (filePath: string) => Promise<string>
      readJson: (
        filePath: string
      ) => Promise<{ success: boolean; data?: unknown; error?: string }>
      getJsonPaths: (
        videoPath: string
      ) => Promise<{ commentsPath: string; summaryPath: string }>
      checkExists: (filePath: string) => Promise<boolean>
    }
  }
}
