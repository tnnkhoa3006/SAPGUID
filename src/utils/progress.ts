import type { LessonStage, ProgressData } from '../types'

export const STORAGE_KEY = 'sap-abap-course-progress'

export const defaultProgress: ProgressData = {
  schemaVersion: 2,
  completedLessons: [],
  quizScores: {},
  lessonStages: {},
  lessonNotes: {},
  playgroundAttempts: {},
  reviewCards: {},
  bossChallengeProgress: {},
  projectProgress: {},
  certificationProgress: [],
  englishProgress: [],
  weeklyReviews: {},
  settings: { theme: 'dark', studyMinutes: 60 },
  streak: 0,
  studyDays: [],
}

function cleanArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []
}

function cleanStageMap(value: unknown): ProgressData['lessonStages'] {
  if (!value || typeof value !== 'object') return {}
  const validStages = new Set(['learn', 'see', 'try', 'check', 'apply'])
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([id, stages]) => [id, cleanArray(stages).filter((stage): stage is LessonStage => validStages.has(stage))])) as ProgressData['lessonStages']
}

function cleanReviewCards(value: unknown): ProgressData['reviewCards'] {
  if (!value || typeof value !== 'object') return {}
  const validRatings = new Set(['easy', 'hard', 'review'])
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).flatMap(([id, card]) => {
    if (!card || typeof card !== 'object') return []
    const entry = card as Record<string, unknown>
    if (!validRatings.has(String(entry.rating)) || typeof entry.reviewedAt !== 'string' || typeof entry.nextReviewAt !== 'string') return []
    return [[id, { rating: entry.rating as ProgressData['reviewCards'][string]['rating'], reviewedAt: entry.reviewedAt, nextReviewAt: entry.nextReviewAt, repetitions: Number.isInteger(entry.repetitions) && Number(entry.repetitions) >= 0 ? Number(entry.repetitions) : 0 }]]
  }))
}

function cleanBossChallenges(value: unknown): ProgressData['bossChallengeProgress'] {
  if (!value || typeof value !== 'object') return {}
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([id, challenge]) => {
    const entry = challenge && typeof challenge === 'object' ? challenge as Record<string, unknown> : {}
    return [id, { completedTasks: cleanArray(entry.completedTasks), completed: entry.completed === true }]
  }))
}

function cleanAttempts(value: unknown): ProgressData['playgroundAttempts'] {
  if (!value || typeof value !== 'object') return {}
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([id, attempt]) => {
    const entry = attempt && typeof attempt === 'object' ? attempt as Record<string, unknown> : {}
    return [id, {
      code: typeof entry.code === 'string' ? entry.code.slice(0, 12000) : '',
      runs: Number.isInteger(entry.runs) && Number(entry.runs) >= 0 ? Number(entry.runs) : 0,
      lastOutput: typeof entry.lastOutput === 'string' ? entry.lastOutput.slice(0, 4000) : '',
      completed: entry.completed === true,
    }]
  }))
}

export function parseProgress(value: unknown): ProgressData {
  if (!value || typeof value !== 'object') throw new Error('The file must contain a progress object.')
  const data = value as Record<string, unknown>
  const settings = data.settings && typeof data.settings === 'object' ? data.settings as Record<string, unknown> : {}
  const minutes = Number(settings.studyMinutes)
  const scores = data.quizScores && typeof data.quizScores === 'object' ? data.quizScores as Record<string, unknown> : {}
  const projects = data.projectProgress && typeof data.projectProgress === 'object' ? data.projectProgress as Record<string, unknown> : {}
  const reviews = data.weeklyReviews && typeof data.weeklyReviews === 'object' ? data.weeklyReviews as Record<string, unknown> : {}
  const notes = data.lessonNotes && typeof data.lessonNotes === 'object' ? data.lessonNotes as Record<string, unknown> : {}
  return {
    ...defaultProgress,
    schemaVersion: 2,
    completedLessons: cleanArray(data.completedLessons),
    quizScores: Object.fromEntries(Object.entries(scores).filter(([, score]) => Number.isFinite(Number(score))).map(([id, score]) => [id, Math.max(0, Math.min(100, Number(score)))])),
    lessonStages: cleanStageMap(data.lessonStages),
    lessonNotes: Object.fromEntries(Object.entries(notes).filter(([, note]) => typeof note === 'string').map(([id, note]) => [id, (note as string).slice(0, 4000)])),
    playgroundAttempts: cleanAttempts(data.playgroundAttempts),
    reviewCards: cleanReviewCards(data.reviewCards),
    bossChallengeProgress: cleanBossChallenges(data.bossChallengeProgress),
    projectProgress: Object.fromEntries(Object.entries(projects).map(([id, items]) => [id, cleanArray(items)])),
    certificationProgress: cleanArray(data.certificationProgress),
    englishProgress: cleanArray(data.englishProgress),
    weeklyReviews: Object.fromEntries(Object.entries(reviews).map(([week, review]) => {
      const entry = review && typeof review === 'object' ? review as Record<string, unknown> : {}
      return [week, { checked: cleanArray(entry.checked), reflection: typeof entry.reflection === 'string' ? entry.reflection.slice(0, 2000) : '' }]
    })),
    settings: {
      theme: settings.theme === 'light' ? 'light' : 'dark',
      studyMinutes: [30, 60, 90, 120].includes(minutes) ? minutes : 60,
    },
    lastStudyDate: typeof data.lastStudyDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.lastStudyDate) ? data.lastStudyDate : undefined,
    streak: Number.isInteger(data.streak) && Number(data.streak) >= 0 ? Number(data.streak) : 0,
    studyDays: cleanArray(data.studyDays).filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)).slice(-180),
  }
}

export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? parseProgress(JSON.parse(raw) as unknown) : defaultProgress
  } catch {
    return defaultProgress
  }
}

export function saveProgress(progress: ProgressData): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)) } catch { /* Storage can be unavailable in private or restricted contexts. */ }
}

export function withStudyActivity(progress: ProgressData): ProgressData {
  const today = new Date().toLocaleDateString('en-CA')
  const studyDays = [...new Set([...progress.studyDays, today])].slice(-180)
  if (progress.lastStudyDate === today) return studyDays.length === progress.studyDays.length ? progress : { ...progress, studyDays }
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA')
  return { ...progress, studyDays, lastStudyDate: today, streak: progress.lastStudyDate === yesterday ? (progress.streak ?? 0) + 1 : 1 }
}
