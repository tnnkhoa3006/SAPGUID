export type LessonType = 'Theory' | 'Coding' | 'Lab' | 'Quiz' | 'Review' | 'Project' | 'Interview' | 'English'
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'
export type LessonStage = 'learn' | 'see' | 'try' | 'check' | 'apply'
export type ReviewRating = 'easy' | 'hard' | 'review'

export interface QuizQuestion {
  prompt: string
  options: string[]
  answer: number
  explanation: string
}

export interface Lesson {
  id: string
  month: number
  week: number
  title: string
  type: LessonType
  duration: number
  difficulty: Difficulty
  topics: string[]
  objective: string
  concept: string
  why: string
  example: string
  explanation: string
  mistakes: string[]
  exercise: string
  expected: string
  checkpoints: string[]
  quiz: QuizQuestion[]
}

export interface LessonVisual {
  title: string
  caption: string
  nodes: { label: string; detail?: string; tone?: 'mint' | 'blue' | 'violet' | 'amber' }[]
}

export interface PlaygroundSpec {
  starterCode: string
  instructions: string[]
  hints: string[]
  solution: string
  expectedOutput: string
  requiredTokens: string[]
}

export interface ExperienceCheck {
  kind: 'choice' | 'order' | 'predict'
  prompt: string
  options?: string[]
  answer: number | string[] | string
  explanation: string
}

export interface LessonExperience {
  hook: { eyebrow: string; question: string; setup: string }
  objectives: string[]
  prerequisiteIds: string[]
  visual?: LessonVisual
  realWorld: { title: string; ticket: string; workflow: string[]; takeaway: string }
  beginner: { analogy: string; explanation: string }
  deepDive: { title: string; content: string }
  commonMistakes: { mistake: string; why: string }[]
  codeNotes?: { token: string; explanation: string }[]
  guidedPractice: { title: string; detail: string }[]
  playground?: PlaygroundSpec
  challenge: { title: string; prompt: string; hints: string[]; solution: string; success: string }
  check?: ExperienceCheck
  summary: string[]
  nextReason: string
  relatedLessonIds: string[]
  projectConnection?: { projectId: string; taskId?: string; title: string; detail: string }
  interview?: { question: string; expected: string; commonMistake: string }
}

export interface BossChallenge {
  id: string
  month: number
  title: string
  subtitle: string
  mission: string
  requiredLessonIds: string[]
  projectId?: string
  skills: string[]
  deliverable: string
  tasks: { id: string; title: string; detail: string }[]
  hints: string[]
}

export interface ReviewCard {
  id: string
  lessonId: string
  prompt: string
  answer: string
  tags: string[]
}

export interface MonthPlan {
  month: number
  label: string
  dates: string
  title: string
  focus: string
  outcome: string
  hours: string
  milestone: string
  color: string
}

export interface ProgressData {
  schemaVersion: 2
  completedLessons: string[]
  quizScores: Record<string, number>
  lessonStages: Record<string, LessonStage[]>
  lessonNotes: Record<string, string>
  playgroundAttempts: Record<string, { code: string; runs: number; lastOutput: string; completed: boolean }>
  reviewCards: Record<string, { rating: ReviewRating; reviewedAt: string; nextReviewAt: string; repetitions: number }>
  bossChallengeProgress: Record<string, { completedTasks: string[]; completed: boolean }>
  projectProgress: Record<string, string[]>
  certificationProgress: string[]
  englishProgress: string[]
  weeklyReviews: Record<string, { checked: string[]; reflection: string }>
  settings: { theme: 'dark' | 'light'; studyMinutes: number }
  lastStudyDate?: string
  streak?: number
  studyDays: string[]
}
