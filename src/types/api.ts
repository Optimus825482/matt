export type AuthPayload = {
  username: string
  password: string
  displayName?: string
}

export type MeResponse =
  | { authenticated: false }
  | {
      authenticated: true
      role: 'child'
      user: {
        id: number
        username: string
        displayName: string
      }
    }

export type Achievement = {
  code: string
  title: string
  description: string
  unlockedAt: string
}

export type ChildDashboard = {
  summary: {
    totalSessions: number
    totalQuestions: number
    bestStreak: number
    averageAccuracy: number
  }
  achievements: Achievement[]
  recentSessions: Array<{
    sessionId: number
    missionTitle: string
    score: number
    accuracy: number
    completedAt: string
  }>
}

export type ChildSessionPayload = {
  missionId: string
  missionTitle: string
  profileId: string
  profileTitle: string
  score: number
  accuracy: number
  bestStreak: number
  questionCount: number
  wrongAnswers: number
  averageReaction: number
  startedAt: string
  completedAt: string
  answers: Array<{
    operation: string
    expectedAnswer: number
    givenAnswer: number
    reactionSeconds: number
    isCorrect: boolean
    points: number
  }>
}

export type SessionSaveResponse = {
  dashboard: ChildDashboard
  newlyUnlocked: Achievement[]
}

export type SuperAdminLoginPayload = {
  username: string
  password: string
}

export type SuperAdminOverview = {
  admin: {
    username: string
  }
  children: Array<{
    userId: number
    username: string
    displayName: string
    lastActivityAt: string | null
  }>
  recentSessions: Array<{
    sessionId: number
    displayName: string
    missionTitle: string
    score: number
    accuracy: number
    questionCount: number
    completedAt: string
  }>
  recentAnswers: Array<{
    answerId: number
    displayName: string
    operation: string
    expectedAnswer: number
    givenAnswer: number
    reactionSeconds: number
    isCorrect: boolean
    createdAt: string
  }>
}

export type ViewerState =
  | { status: 'loading' }
  | { status: 'guest' }
  | {
      status: 'child'
      user: {
        id: number
        username: string
        displayName: string
      }
    }
  | { status: 'superadmin-guest' }
  | {
      status: 'superadmin'
      user: {
        username: string
      }
    }
