export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division'

export type MissionId = 'mixed' | 'tables' | 'division' | 'warmup'
export type ProfileId = 'steady' | 'focus' | 'boost'

export type Question = {
  id: string
  operation: Operation
  left: number
  right: number
  symbol: '+' | '-' | '×' | '÷'
  answer: number
  prompt: string
  createdAt: number
}

export type AnswerFeedback = {
  isCorrect: boolean
  message: string
}

export type HistoryItem = {
  questionId: string
  operation: Operation
  expectedAnswer: number
  givenAnswer: number
  isCorrect: boolean
  points: number
  reactionSeconds: number
  feedback: AnswerFeedback
}

export type SessionState = {
  missionId: MissionId
  profileId: ProfileId
  currentQuestion: Question
  history: HistoryItem[]
  score: number
  streak: number
  bestStreak: number
  remainingSeconds: number
  status: 'playing' | 'finished'
  feedback: AnswerFeedback
  coachText: string
}

export type Mission = {
  id: MissionId
  title: string
  description: string
  skills: string[]
  goal: string
  strategy: string
}

export type Profile = {
  id: ProfileId
  title: string
  description: string
  seconds: number
  label: string
}

export type PerformanceBand = {
  title: string
  description: string
  badge: string
}
