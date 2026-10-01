import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, Command, Moon, Search, Sun, X } from 'lucide-react'
import { Sidebar, type View } from './components/Sidebar'
import { defaultProgress, loadProgress, parseProgress, saveProgress, withStudyActivity } from './utils/progress'
import { lessons, months, validateCurriculum } from './data/curriculum'
import { certificationDomains, englishTracks, glossary, projects } from './data/resources'
import { bossChallenges, isLessonAvailable, reviewCards } from './data/learningExperience'
import type { LessonStage, ProgressData, ReviewRating } from './types'
import { CertificationPage, EnglishPage, GlossaryPage, InterviewPage, ProjectsPage, Roadmap, SettingsPage, TodayPage, WeeklyPage } from './pages/Pages'
import { CoursePlayer } from './components/CoursePlayer'
import { BossChallengePage, CourseHub, KnowledgeMapPage, LearningDashboard, ReviewStudio } from './components/LearningExperiencePages'

const curriculumIssues = validateCurriculum()
if (curriculumIssues.length) console.error('Course data validation:', curriculumIssues)

interface SearchHit { title: string; subtitle: string; category: string; lessonId?: string; view: View }

export default function App() {
  const [progress, setProgress] = useState<ProgressData>(loadProgress)
  const [view, setView] = useState<View>('dashboard')
  const [lessonId, setLessonId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(() => window.matchMedia('(max-width: 760px)').matches === false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => { saveProgress(progress) }, [progress])
  useEffect(() => { document.documentElement.dataset.theme = progress.settings.theme }, [progress.settings.theme])
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 2500); return () => window.clearTimeout(timer) }, [toast])
  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); setSearchOpen(true); window.setTimeout(() => document.querySelector<HTMLInputElement>('.global-search input')?.focus(), 0)
      }
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setSearch('')
        closeNavigationOnSmallScreens()
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const completed = progress.completedLessons.filter((id) => lessons.some((item) => item.id === id)).length
  const percent = Math.round((completed / lessons.length) * 100)
  const nextLesson = lessons.find((item) => !progress.completedLessons.includes(item.id) && isLessonAvailable(item.id, progress.completedLessons, progress.bossChallengeProgress)) ?? lessons.find((item) => !progress.completedLessons.includes(item.id)) ?? lessons[lessons.length - 1]
  const activeLesson = view === 'lesson' ? lessons.find((item) => item.id === lessonId) : undefined
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac')
  const streak = progress.lastStudyDate === new Date().toLocaleDateString('en-CA') ? (progress.streak ?? 0) : 0

  function closeNavigationOnSmallScreens() { if (window.matchMedia('(max-width: 760px)').matches) setMobileOpen(false) }
  function navigate(next: View) { setView(next); closeNavigationOnSmallScreens(); setSearchOpen(false); setSearch('') }
  function openLesson(id: string) {
    if (!lessons.some((item) => item.id === id)) { setToast('That lesson is no longer available. Showing the course player.'); setView('course'); return }
    if (!progress.completedLessons.includes(id) && !isLessonAvailable(id, progress.completedLessons, progress.bossChallengeProgress)) { setToast('Finish the required lessons and earlier course checkpoint first, then this mission will unlock.'); return }
    setLessonId(id); setView('lesson'); setSearch(''); setSearchOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function updateActivity(update: (current: ProgressData) => ProgressData) {
    setProgress((current) => withStudyActivity(update(current)))
  }
  function completeLesson(id: string) {
    updateActivity((current) => ({ ...current, completedLessons: current.completedLessons.includes(id) ? current.completedLessons : [...current.completedLessons, id], lessonStages: { ...current.lessonStages, [id]: ['learn', 'see', 'try', 'check', 'apply'] } }))
    setToast('Lesson complete — your roadmap and review queue are up to date.')
  }
  function saveQuizScore(id: string, score: number) {
    updateActivity((current) => ({ ...current, quizScores: { ...current.quizScores, [id]: Math.max(current.quizScores[id] ?? 0, score) } }))
  }
  function markLessonStage(id: string, stage: LessonStage) {
    updateActivity((current) => {
      const completedStages = current.lessonStages[id] ?? []
      if (completedStages.includes(stage)) return current
      return { ...current, lessonStages: { ...current.lessonStages, [id]: [...completedStages, stage] } }
    })
  }
  function saveLessonNote(id: string, note: string) {
    updateActivity((current) => ({ ...current, lessonNotes: { ...current.lessonNotes, [id]: note.slice(0, 4000) } }))
  }
  function savePlaygroundAttempt(id: string, attempt: ProgressData['playgroundAttempts'][string]) {
    updateActivity((current) => ({ ...current, playgroundAttempts: { ...current.playgroundAttempts, [id]: attempt } }))
  }
  function rateReview(cardId: string, rating: ReviewRating) {
    const days = rating === 'easy' ? 7 : rating === 'hard' ? 2 : 1
    updateActivity((current) => {
      const existing = current.reviewCards[cardId]
      return { ...current, reviewCards: { ...current.reviewCards, [cardId]: { rating, reviewedAt: new Date().toISOString(), nextReviewAt: new Date(Date.now() + days * 86400000).toISOString(), repetitions: (existing?.repetitions ?? 0) + 1 } } }
    })
  }
  function toggleBossTask(challengeId: string, taskId: string) {
    updateActivity((current) => {
      const entry = current.bossChallengeProgress[challengeId] ?? { completedTasks: [], completed: false }
      const completedTasks = entry.completedTasks.includes(taskId) ? entry.completedTasks.filter((id) => id !== taskId) : [...entry.completedTasks, taskId]
      return { ...current, bossChallengeProgress: { ...current.bossChallengeProgress, [challengeId]: { ...entry, completedTasks, completed: false } } }
    })
  }
  function completeBossChallenge(challengeId: string) {
    const challenge = bossChallenges.find((item) => item.id === challengeId)
    if (!challenge) return
    const entry = progress.bossChallengeProgress[challengeId] ?? { completedTasks: [], completed: false }
    const lessonsReady = challenge.requiredLessonIds.every((id) => progress.completedLessons.includes(id))
    const tasksReady = challenge.tasks.every((task) => entry.completedTasks.includes(task.id))
    if (!lessonsReady || !tasksReady) { setToast('Complete the required lessons and each challenge deliverable before claiming it.'); return }
    updateActivity((current) => ({ ...current, bossChallengeProgress: { ...current.bossChallengeProgress, [challengeId]: { ...(current.bossChallengeProgress[challengeId] ?? { completedTasks: [], completed: false }), completed: true } } }))
    setToast('Boss challenge complete — add the deliverable to your portfolio evidence.')
  }
  function toggleList(field: 'englishProgress' | 'certificationProgress', id: string) {
    updateActivity((current) => ({ ...current, [field]: current[field].includes(id) ? current[field].filter((item) => item !== id) : [...current[field], id] }))
  }
  function toggleProject(projectId: string, taskId: string) {
    updateActivity((current) => {
      const existing = current.projectProgress[projectId] ?? []
      const updated = existing.includes(taskId) ? existing.filter((id) => id !== taskId) : [...existing, taskId]
      return { ...current, projectProgress: { ...current.projectProgress, [projectId]: updated } }
    })
  }
  function setDuration(minutes: number) {
    if ([30,60,90,120].includes(minutes)) setProgress((current) => ({ ...current, settings: { ...current.settings, studyMinutes: minutes } }))
  }
  function updateReview(week: number, taskId: string, checked: boolean) {
    updateActivity((current) => {
      const key = String(week)
      const entry = current.weeklyReviews[key] ?? { checked: [], reflection: '' }
      const values = checked ? [...new Set([...entry.checked, taskId])] : entry.checked.filter((id) => id !== taskId)
      return { ...current, weeklyReviews: { ...current.weeklyReviews, [key]: { ...entry, checked: values } } }
    })
  }
  function updateReflection(week: number, reflection: string) {
    setProgress((current) => {
      const key = String(week)
      const entry = current.weeklyReviews[key] ?? { checked: [], reflection: '' }
      return { ...current, weeklyReviews: { ...current.weeklyReviews, [key]: { ...entry, reflection } } }
    })
  }
  function exportProgress() {
    const file = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(file)
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = 'northstar-sap-abap-progress.json'; anchor.click(); URL.revokeObjectURL(url)
  }
  async function importProgress(file: File): Promise<boolean> {
    try {
      const data = parseProgress(JSON.parse(await file.text()) as unknown)
      const lessonIds = new Set(lessons.map((item) => item.id))
      data.completedLessons = data.completedLessons.filter((id) => lessonIds.has(id))
      data.lessonStages = Object.fromEntries(Object.entries(data.lessonStages).filter(([id]) => lessonIds.has(id)))
      data.lessonNotes = Object.fromEntries(Object.entries(data.lessonNotes).filter(([id]) => lessonIds.has(id)))
      data.playgroundAttempts = Object.fromEntries(Object.entries(data.playgroundAttempts).filter(([id]) => lessonIds.has(id)))
      const reviewIds = new Set(reviewCards.map((item) => item.id))
      data.reviewCards = Object.fromEntries(Object.entries(data.reviewCards).filter(([id]) => reviewIds.has(id)))
      const bossIds = new Set(bossChallenges.map((item) => item.id))
      data.bossChallengeProgress = Object.fromEntries(Object.entries(data.bossChallengeProgress).filter(([id]) => bossIds.has(id)))
      for (const project of projects) data.projectProgress[project.id] = (data.projectProgress[project.id] ?? []).filter((id) => project.tasks.some((task) => task.id === id))
      data.englishProgress = data.englishProgress.filter((id) => englishTracks.some((track) => track.id === id))
      data.certificationProgress = data.certificationProgress.filter((id) => certificationDomains.some((domain) => domain.id === id))
      setProgress(data); return true
    } catch { return false }
  }
  function resetProgress() {
    if (window.confirm('Reset all course progress, quiz scores, project checklists, and settings in this browser?')) {
      setProgress({ ...defaultProgress, settings: { ...defaultProgress.settings } }); setToast('Local learning progress has been reset.')
    }
  }
  function goNextLesson() {
    const index = lessons.findIndex((item) => item.id === lessonId)
    const next = index >= 0 ? lessons[index + 1] : nextLesson
    if (next) openLesson(next.id); else navigate('challenges')
  }
  function goPreviousLesson() {
    const index = lessons.findIndex((item) => item.id === lessonId)
    const previous = index > 0 ? lessons[index - 1] : undefined
    if (previous) openLesson(previous.id); else navigate('course')
  }

  const hits = useMemo<SearchHit[]>(() => {
    const term = search.trim().toLowerCase()
    if (!term) return []
    const found: SearchHit[] = []
    lessons.forEach((item) => {
      if (`${item.title} ${item.topics.join(' ')} ${item.concept} ${item.objective} ${months[item.month - 1]?.title}`.toLowerCase().includes(term)) {
        found.push({ title: item.title, subtitle: `Month ${item.month} · ${item.topics.slice(0,2).join(', ')}`, category: 'LESSON', lessonId: item.id, view: 'lesson' })
      }
    })
    projects.forEach((item) => { if (`${item.title} ${item.subtitle} ${item.description} ${item.technologies.join(' ')}`.toLowerCase().includes(term)) found.push({ title: item.title, subtitle: item.subtitle, category: 'PROJECT', view: 'projects' }) })
    bossChallenges.forEach((item) => { if (`${item.title} ${item.subtitle} ${item.mission} ${item.skills.join(' ')}`.toLowerCase().includes(term)) found.push({ title: item.title, subtitle: item.subtitle, category: 'CHALLENGE', view: 'challenges' }) })
    reviewCards.forEach((item) => { if (`${item.prompt} ${item.answer} ${item.tags.join(' ')}`.toLowerCase().includes(term)) found.push({ title: item.prompt, subtitle: item.tags.join(', '), category: 'REVIEW', view: 'review' }) })
    glossary.forEach((item) => { if (`${item.term} ${item.simple} ${item.technical} ${item.related}`.toLowerCase().includes(term)) found.push({ title: item.term, subtitle: item.simple, category: 'GLOSSARY', view: 'glossary' }) })
    return found.slice(0, 9)
  }, [search])

  function chooseHit(hit: SearchHit) { if (hit.lessonId) openLesson(hit.lessonId); else navigate(hit.view) }
  const title = activeLesson?.title ?? ({ dashboard: 'Dashboard', roadmap: 'The roadmap', course: 'Course player', lesson: 'Lesson', map: 'Course map', challenges: 'Boss challenges', review: 'Review queue', today: 'Today’s study', weekly: 'Weekly review', projects: 'Projects', english: 'English for SAP', certification: 'Certification', interviews: 'Interview practice', glossary: 'Glossary', settings: 'Settings' } satisfies Record<View, string>)[view]

  return <div className={`app-shell${mobileOpen ? ' nav-open' : ''}`}><Sidebar active={view} onNavigate={navigate} progress={percent} completed={completed} total={lessons.length} open={mobileOpen} onClose={closeNavigationOnSmallScreens} />
    <main className="main-shell"><header className="topbar"><div className="topbar-left"><button type="button" className="sidebar-toggle" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? 'Collapse navigation' : 'Expand navigation'} aria-expanded={mobileOpen} aria-controls="main-navigation">{mobileOpen ? '<' : '>'}</button><div className="breadcrumb"><span>Workspace</span><span>/</span><strong>{title}</strong></div></div><div className="topbar-right"><div className={`global-search${searchOpen ? ' search-focused' : ''}`}><Search size={16} /><input value={search} placeholder="Search lessons, topics, glossary…" aria-label="Search course content" onFocus={() => setSearchOpen(true)} onChange={(e) => { setSearch(e.target.value); setSearchOpen(true) }} onKeyDown={(e) => { if (e.key === 'Enter' && hits[0]) chooseHit(hits[0]); if (e.key === 'Escape') { setSearchOpen(false); setSearch('') } }} /><span className="search-shortcut">{isMac ? <><Command size={11} /> K</> : 'Ctrl K'}</span>{searchOpen && search && <button className="search-clear" aria-label="Clear search" onClick={() => setSearch('')}><X size={14} /></button>}</div><button className="icon-button topbar-theme" onClick={() => setProgress((current) => ({ ...current, settings: { ...current.settings, theme: current.settings.theme === 'dark' ? 'light' : 'dark' } }))} aria-label="Toggle color theme">{progress.settings.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button><button className="topbar-avatar" onClick={() => navigate('settings')} aria-label="Open profile settings">K</button></div></header>
      {searchOpen && search && <><button className="search-dismiss" aria-label="Close search results" onClick={() => setSearchOpen(false)} /><div className="search-popover"><div className="search-popover-head"><span>SEARCH RESULTS</span><span>{hits.length} found</span></div>{hits.length ? hits.map((hit) => <button className="search-hit" key={`${hit.category}-${hit.title}`} onClick={() => chooseHit(hit)}><span className={`search-hit-type ${hit.category.toLowerCase()}`}>{hit.category.slice(0,1)}</span><span><strong>{hit.title}</strong><small>{hit.subtitle}</small></span><span className="search-category">{hit.category}</span></button>) : <div className="search-empty"><Search size={17} /><span>No results. Try “RAP”, “debugging”, or “purchase order”.</span></div>}<div className="search-footer">Press <kbd>Enter</kbd> to open the first result <kbd>Esc</kbd> to close</div></div></>}
      <div className="content-area" onClick={() => { if (searchOpen && !search) setSearchOpen(false) }}>
        {view === 'dashboard' && <LearningDashboard progress={progress} completed={completed} percent={percent} streak={streak} nextLesson={nextLesson} onOpenLesson={openLesson} onNavigate={navigate} />}
        {view === 'roadmap' && <Roadmap progress={progress} onLesson={openLesson} />}
        {view === 'course' && <CourseHub progress={progress} onOpenLesson={openLesson} onNavigate={navigate} />}
        {view === 'map' && <KnowledgeMapPage progress={progress} onOpenLesson={openLesson} />}
        {view === 'challenges' && <BossChallengePage progress={progress} onOpenLesson={openLesson} onNavigateProjects={() => navigate('projects')} onToggleTask={toggleBossTask} onComplete={completeBossChallenge} />}
        {view === 'review' && <ReviewStudio progress={progress} onRate={rateReview} onOpenLesson={openLesson} />}
        {view === 'lesson' && (activeLesson ? <CoursePlayer key={activeLesson.id} lesson={activeLesson} progress={progress} onOpenLesson={openLesson} onBack={() => navigate('course')} onComplete={completeLesson} onScore={saveQuizScore} onStageDone={markLessonStage} onSaveNote={saveLessonNote} onSaveAttempt={savePlaygroundAttempt} onNavigateProjects={() => navigate('projects')} onNext={goNextLesson} onPrevious={goPreviousLesson} /> : <div className="empty-state page-empty"><Search size={24} /><strong>This lesson isn’t available.</strong><span>Choose a lesson from the course player to keep going.</span><button className="button button-primary" onClick={() => navigate('course')}>Open course player <ArrowRight size={15} /></button></div>)}
        {view === 'today' && <TodayPage progress={progress} next={nextLesson} onDuration={setDuration} onLesson={openLesson} />}
        {view === 'weekly' && <WeeklyPage progress={progress} next={nextLesson} onReview={updateReview} onReflection={updateReflection} />}
        {view === 'projects' && <ProjectsPage progress={progress} onToggle={toggleProject} />}
        {view === 'english' && <EnglishPage progress={progress} onToggle={(id) => toggleList('englishProgress', id)} />}
        {view === 'certification' && <CertificationPage progress={progress} onToggle={(id) => toggleList('certificationProgress', id)} />}
        {view === 'interviews' && <InterviewPage />}
        {view === 'glossary' && <GlossaryPage />}
        {view === 'settings' && <SettingsPage progress={progress} onTheme={(theme) => setProgress((current) => ({ ...current, settings: { ...current.settings, theme } }))} onDuration={setDuration} onExport={exportProgress} onImport={importProgress} onReset={resetProgress} />}
        <footer className="app-footer"><span><span className="footer-mark">N</span> NORTHSTAR LEARNING SYSTEM</span><span>Six-month SAP ABAP journey <span className="footer-separator">·</span> Oct 2026 — Mar 2027</span><span>YOUR PROGRESS, YOUR PACE <span className="footer-spark">✦</span></span></footer>
      </div>
      {toast && <div className="toast-message"><Check size={15} />{toast}</div>}
    </main>
  </div>
}
