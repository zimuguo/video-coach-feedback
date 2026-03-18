export interface Comment {
  id: string
  timestamp: number
  timestampDisplay: string
  text: string
  createdAt: string
}

export interface SummaryData {
  crowdWellDone: string
  crowdToTry: string
  peerFeedbackWellDone: string
  attentionSecuring: string
  otherFeedback: string
}

export interface CommentsFile {
  version: string
  videoFilename: string
  createdAt: string
  coachName: string
  teacherName: string
  comments: Comment[]
}

export interface SummaryFile {
  version: string
  videoFilename: string
  createdAt: string
  coachName: string
  teacherName: string
  summary: SummaryData
}

export const SUMMARY_LABELS: Record<keyof SummaryData, string> = {
  crowdWellDone: 'Well-done with Implementing C-R-O-W-D Prompts',
  crowdToTry: 'More C-R-O-W-D Prompts to Try',
  peerFeedbackWellDone: 'Well-done with Implementing P-E-E-R Feedback Strategies',
  attentionSecuring: 'Performance Feedback on Using Attention Securing Prompts (As Needed)',
  otherFeedback: 'Other Feedback'
}

export const EMPTY_SUMMARY: SummaryData = {
  crowdWellDone: '',
  crowdToTry: '',
  peerFeedbackWellDone: '',
  attentionSecuring: '',
  otherFeedback: ''
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
