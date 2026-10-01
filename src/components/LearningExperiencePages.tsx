import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowRight, Award, BookOpen, Check, CheckCircle2, ChevronDown, ChevronRight, Circle, Clock3, Compass, Flame, FolderKanban, LockKeyhole, Play, RotateCcw, Sparkles, Target, Zap } from 'lucide-react'
import { lessons, months } from '../data/curriculum'
import { bossChallenges, courseMapNodes, getWeekGoal, isLessonAvailable, reviewCards, type CourseMapNode } from '../data/learningExperience'
import { projects } from '../data/resources'
import type { BossChallenge, ProgressData, ReviewRating } from '../types'
import type { View } from './Sidebar'
import { ProgressBar } from './ProgressBar'

interface LearningDashboardProps {
  progress: ProgressData
  completed: number
  percent: number
  streak: number
  nextLesson: (typeof lessons)[number]
  onOpenLesson: (id: string) => void
  onNavigate: (view: View) => void
}

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div></div>
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="chip">{children}</span>
}

function lessonPercent(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0
}

function getNextLesson(progress: ProgressData) {
  return lessons.find((lesson) => !progress.completedLessons.includes(lesson.id) && isLessonAvailable(lesson.id, progress.completedLessons, progress.bossChallengeProgress))
    ?? lessons.find((lesson) => !progress.completedLessons.includes(lesson.id))
    ?? lessons[lessons.length - 1]
}

function activeBoss(progress: ProgressData) {
  return bossChallenges.find((boss) => !progress.bossChallengeProgress[boss.id]?.completed) ?? bossChallenges[bossChallenges.length - 1]
}

function dueReviewCount(progress: ProgressData) {
  const now = Date.now()
  return reviewCards.filter((card) => progress.completedLessons.includes(card.lessonId)).filter((card) => {
    const state = progress.reviewCards[card.id]
    return !state || new Date(state.nextReviewAt).getTime() <= now
  }).length
}

export function LearningDashboard({ progress, completed, percent, streak, nextLesson, onOpenLesson, onNavigate }: LearningDashboardProps) {
  const next = nextLesson ?? getNextLesson(progress)
  const month = months.find((item) => item.month === next.month) ?? months[0]
  const boss = activeBoss(progress)
  const bossState = progress.bossChallengeProgress[boss.id]
  const projectCount = Object.values(progress.projectProgress).reduce((sum, checked) => sum + checked.length, 0)
  const reviewsDue = dueReviewCount(progress)
  const weekLessons = lessons.filter((lesson) => lesson.month === next.month && lesson.week === next.week)
  const lowScores = lessons.filter((lesson) => progress.quizScores[lesson.id] !== undefined && progress.quizScores[lesson.id] < 100).slice(0, 3)
  const recentlyLearned = [...progress.completedLessons].reverse().map((id) => lessons.find((lesson) => lesson.id === id)).filter((lesson): lesson is (typeof lessons)[number] => Boolean(lesson)).slice(0, 3)
  const today = new Date()
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7)).toLocaleDateString('en-CA')
  const sessionsThisWeek = progress.studyDays.filter((date) => date >= monday).length

  return <>
    <PageIntro eyebrow="YOUR LEARNING DESK" title="Build your ABAP skills, one step at a time." description="A practical course path from SAP foundations to project work and a confident junior interview." />
    <section className="panel continue-panel">
      <div className="continue-top"><div className="eyebrow"><Sparkles size={13} /> CURRENT JOURNEY</div><Tag>MONTH {next.month} · {month.dates.toUpperCase()}</Tag></div>
      <div className="continue-content"><div><div className="continue-number">WEEK {String(next.week).padStart(2, '0')} <span>· {next.type.toUpperCase()}</span></div><h2>{next.title}</h2><p>{next.objective}</p><div className="continue-meta"><span><Clock3 size={14} /> {next.duration} min</span><span><Zap size={14} /> {next.difficulty}</span><span><BookOpen size={14} /> {completed} of {lessons.length} lessons</span></div><button className="button button-primary" onClick={() => onOpenLesson(next.id)}><Play size={14} fill="currentColor" /> Continue learning <ArrowRight size={15} /></button></div><div className="lesson-progress-ring" style={{ '--ring-progress': `${percent}%` } as CSSProperties}><div><strong>{percent}%</strong><span>COURSE<br />COMPLETE</span></div></div></div>
      <div className="continue-footer"><span>MONTH {next.month} FOCUS</span><strong>{month.focus}</strong><button className="text-button" onClick={() => onNavigate('roadmap')}>Roadmap <ArrowRight size={14} /></button></div>
    </section>
    <div className="stat-grid four learning-stat-grid">
      <div className="stat-card tint-mint"><div className="stat-head"><span>LESSONS COMPLETE</span><CheckCircle2 size={17} /></div><strong>{completed}<small> / {lessons.length}</small></strong><small>Keep a steady pace</small></div>
      <div className="stat-card tint-amber"><div className="stat-head"><span>REVIEWS DUE</span><RotateCcw size={17} /></div><strong>{reviewsDue}</strong><small>{reviewsDue ? 'Strengthen recall today' : 'You are up to date'}</small></div>
      <div className="stat-card tint-blue"><div className="stat-head"><span>PROJECT EVIDENCE</span><FolderKanban size={17} /></div><strong>{projectCount}</strong><small>Milestones checked</small></div>
      <div className="stat-card tint-violet"><div className="stat-head"><span>STUDY STREAK</span><Flame size={17} /></div><strong>{streak}<small> days</small></strong><small>Return for a short session</small></div>
    </div>
    <div className="dashboard-main-grid learning-dashboard-grid">
      <section className="panel today-panel"><div className="panel-title-row"><div><div className="eyebrow">THIS WEEK</div><h2>What you are building</h2></div><span className="today-icon"><Target size={16} /></span></div><p className="learning-week-goal">{getWeekGoal(next.month, next.week)}</p><div className="milestone-list">{weekLessons.slice(0, 4).map((lesson) => { const done = progress.completedLessons.includes(lesson.id); return <button className="milestone learning-next-item" key={lesson.id} onClick={() => onOpenLesson(lesson.id)}><span className={`milestone-icon ${done ? 'mint' : 'blue'}`}>{done ? <Check size={15} /> : <Circle size={15} />}</span><span><strong>{lesson.title}</strong><small>{lesson.duration} min · {lesson.type}</small></span><ChevronRight size={15} /></button> })}</div><button className="button button-quiet full-width" onClick={() => onNavigate('course')}>Open course hub <ArrowRight size={14} /></button></section>
      <aside className="panel today-panel"><div className="panel-title-row"><div><div className="eyebrow">MILESTONE CHALLENGE</div><h2>{boss.title.replace('Boss Challenge: ', '')}</h2></div><span className="today-icon"><Award size={16} /></span></div><p className="learning-boss-summary">{boss.subtitle}</p><p>{boss.mission}</p><div className="learning-boss-progress"><span>{bossState?.completedTasks.length ?? 0} / {boss.tasks.length} steps</span><span>{bossState?.completed ? 'Complete' : 'In progress'}</span></div><button className="button button-primary full-width" onClick={() => onNavigate('challenges')}>Open challenge <ArrowRight size={14} /></button></aside>
    </div>
    <section className="panel learning-shortcuts"><div><span className="eyebrow">YOUR NEXT GOOD ACTION</span><h2>Recall before you reread.</h2><p>{reviewsDue ? `${reviewsDue} review ${reviewsDue === 1 ? 'card is' : 'cards are'} ready. A short retrieval session can reveal what stuck.` : 'Review cards are scheduled. You can still practice them early.'}</p></div><button className="button button-outline" onClick={() => onNavigate('review')}>Start a review <RotateCcw size={14} /></button></section>
    <div className="learning-dashboard-extras">
      <section className="panel dashboard-detail-card"><div className="eyebrow">WEEKLY TARGET</div><h2>{Math.min(sessionsThisWeek, 5)} / 5 study days</h2><ProgressBar value={Math.min(100, Math.round(sessionsThisWeek / 5 * 100))} compact /><p>Short, focused sessions count. Your learning days are saved locally.</p></section>
      <section className="panel dashboard-detail-card"><div className="eyebrow">WEAK AREAS</div><h2>{lowScores.length ? 'Topics to revisit' : 'No weak signals yet'}</h2>{lowScores.length ? lowScores.map((lesson) => <button className="dashboard-topic-link" key={lesson.id} onClick={() => onOpenLesson(lesson.id)}><span>{lesson.topics.slice(0, 2).join(' · ')}</span><small>{progress.quizScores[lesson.id]}% on {lesson.title}</small><ChevronRight size={13} /></button>) : <p>Complete a knowledge check to find concepts that need another practice rep.</p>}</section>
      <section className="panel dashboard-detail-card"><div className="eyebrow">RECENTLY LEARNED</div><h2>Your last completed lessons</h2>{recentlyLearned.length ? recentlyLearned.map((lesson) => <button className="dashboard-topic-link" key={lesson.id} onClick={() => onOpenLesson(lesson.id)}><span>{lesson.title}</span><small>Month {lesson.month} · Week {lesson.week}</small><ArrowRight size={13} /></button>) : <p>Your finished lessons will appear here as you make progress.</p>}</section>
      <section className="panel dashboard-detail-card"><div className="eyebrow">PORTFOLIO PROJECTS</div><h2>Turn lessons into evidence</h2>{projects.map((project) => { const checked = progress.projectProgress[project.id] ?? []; const value = lessonPercent(checked.length, project.tasks.length); return <div className="dashboard-project-progress" key={project.id}><div><strong>{project.title}</strong><span>{value}%</span></div><ProgressBar value={value} compact /></div> })}<button className="text-button" onClick={() => onNavigate('projects')}>Open projects <ArrowRight size={13} /></button></section>
    </div>
  </>
}

export function CourseHub({ progress, onOpenLesson, onNavigate }: { progress: ProgressData; onOpenLesson: (id: string) => void; onNavigate: (view: View) => void }) {
  const [monthFilter, setMonthFilter] = useState<number | 'all'>('all')
  const [expandedWeeks, setExpandedWeeks] = useState<string[] | null>(null)
  const filteredMonths = months.filter((month) => monthFilter === 'all' || month.month === monthFilter)
  return <>
    <PageIntro eyebrow="COURSE HUB" title="Follow the learning path." description="Choose a lesson, see why it belongs in this week, and track progress toward each monthly outcome." />
    <div className="course-filter-bar"><div className="filter-title"><Compass size={17} /><span>{lessons.length} lessons</span></div><label>Show<select value={monthFilter} onChange={(event) => setMonthFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))}><option value="all">All months</option>{months.map((month) => <option key={month.month} value={month.month}>Month {month.month}</option>)}</select></label><button className="button button-outline" onClick={() => setExpandedWeeks(expandedWeeks === null ? [] : null)}>{expandedWeeks === null ? 'Collapse weeks' : 'Expand weeks'}</button><button className="button button-quiet" onClick={() => onNavigate('map')}>View course map <ArrowRight size={14} /></button></div>
    {filteredMonths.map((month) => {
      const monthLessons = lessons.filter((lesson) => lesson.month === month.month)
      const done = monthLessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length
      const weeks = Array.from(new Set(monthLessons.map((lesson) => lesson.week))).sort((a, b) => a - b)
      return <section className="course-month" key={month.month}><div className="course-month-header"><div className="month-token">{String(month.month).padStart(2, '0')}</div><div><div className="eyebrow">{month.dates.toUpperCase()} · {month.hours.toUpperCase()}</div><h2>{month.title}</h2><p>{month.outcome}</p></div><div className="course-month-progress"><span>{done}/{monthLessons.length}</span><ProgressBar value={lessonPercent(done, monthLessons.length)} compact /></div></div>
        <div className="learning-week-list">{weeks.map((week) => {
          const weekId = `${month.month}-${week}`
          const open = expandedWeeks === null || expandedWeeks.includes(weekId)
          const entries = monthLessons.filter((lesson) => lesson.week === week)
          const weekDone = entries.filter((lesson) => progress.completedLessons.includes(lesson.id)).length
          return <section className={`panel learning-week${open ? ' learning-week-open' : ''}`} key={weekId}><button className="learning-week-toggle" aria-expanded={open} onClick={() => setExpandedWeeks((current) => {
            const allWeekIds = months.flatMap((plan) => Array.from(new Set(lessons.filter((item) => item.month === plan.month).map((item) => `${plan.month}-${item.week}`))))
            if (current === null) return allWeekIds.filter((id) => id !== weekId)
            return current.includes(weekId) ? current.filter((id) => id !== weekId) : [...current, weekId]
          })}><span><span className="eyebrow">WEEK {String(week).padStart(2, '0')} · {weekDone}/{entries.length} LESSONS</span><strong>{getWeekGoal(month.month, week)}</strong></span>{open ? <ChevronDown size={17} /> : <ChevronRight size={17} />}</button>{open && <div className="learning-lesson-list">{entries.map((lesson) => {
            const complete = progress.completedLessons.includes(lesson.id)
            const available = isLessonAvailable(lesson.id, progress.completedLessons, progress.bossChallengeProgress)
            return <button className={`learning-lesson-row${complete ? ' learning-lesson-complete' : ''}`} key={lesson.id} onClick={() => onOpenLesson(lesson.id)} disabled={!available && !complete}><span className="learning-lesson-state">{complete ? <CheckCircle2 size={17} /> : available ? <Circle size={17} /> : <LockKeyhole size={15} />}</span><span className="learning-lesson-info"><strong>{lesson.title}</strong><small>{lesson.objective}</small></span><span className="learning-lesson-meta"><Tag>{lesson.type}</Tag><small><Clock3 size={12} /> {lesson.duration} min</small></span><ArrowRight size={15} /></button>
          })}</div>}</section>
        })}</div>
        {bossChallenges.filter((boss) => boss.month === month.month).map((boss) => {
          const state = progress.bossChallengeProgress[boss.id]
          return <article className="course-boss-preview" key={boss.id}><div><span className="eyebrow">MONTH {month.month} CHECKPOINT</span><h3>{boss.title}</h3><p>{boss.subtitle} · {boss.deliverable}</p></div><span className={state?.completed ? 'checkpoint-state complete' : 'checkpoint-state'}>{state?.completed ? 'Complete' : 'Open challenge'}</span><button className="button button-outline" onClick={() => onNavigate('challenges')}>View challenge <ArrowRight size={14} /></button></article>
        })}
      </section>
    })}
  </>
}

function nodeStatus(node: CourseMapNode, progress: ProgressData) {
  const doneCount = node.lessonIds.filter((id) => progress.completedLessons.includes(id)).length
  const complete = node.lessonIds.length > 0 && doneCount === node.lessonIds.length
  const available = node.prerequisiteNodeIds.every((id) => {
    const prerequisite = courseMapNodes.find((candidate) => candidate.id === id)
    return prerequisite && prerequisite.lessonIds.every((lessonId) => progress.completedLessons.includes(lessonId))
  }) && node.lessonIds.some((id) => isLessonAvailable(id, progress.completedLessons, progress.bossChallengeProgress))
  return { doneCount, complete, available }
}

export function KnowledgeMapPage({ progress, onOpenLesson }: { progress: ProgressData; onOpenLesson: (id: string) => void }) {
  const [selectedId, setSelectedId] = useState(courseMapNodes[0]?.id ?? '')
  const selected = courseMapNodes.find((node) => node.id === selectedId) ?? courseMapNodes[0]
  const selectedLessons = selected ? lessons.filter((lesson) => selected.lessonIds.includes(lesson.id)) : []
  return <>
    <PageIntro eyebrow="INTERACTIVE COURSE MAP" title="See how the skills connect." description="Each phase builds on earlier concepts. Open a phase to see its lessons and choose where to continue." />
    <div className="knowledge-map-layout"><section className="knowledge-map-path" aria-label="Course phases">{courseMapNodes.map((node, index) => {
      const status = nodeStatus(node, progress)
      return <div className="knowledge-map-step" key={node.id}><button className={`knowledge-map-node tone-${node.tone}${selectedId === node.id ? ' selected' : ''}${status.complete ? ' complete' : ''}${!status.available ? ' locked' : ''}`} onClick={() => setSelectedId(node.id)} aria-pressed={selectedId === node.id}><span className="knowledge-map-index">{status.complete ? <Check size={17} /> : !status.available ? <LockKeyhole size={15} /> : String(index + 1).padStart(2, '0')}</span><span><strong>{node.title}</strong><small>{node.short}</small></span><span className="knowledge-map-count">{status.doneCount}/{node.lessonIds.length}</span></button>{index < courseMapNodes.length - 1 && <div className={`knowledge-map-connector${status.complete ? ' connector-done' : ''}`} aria-hidden="true" />}</div>
    })}</section><aside className="panel knowledge-map-detail">{selected && <><div className="eyebrow">PHASE DETAILS</div><h2>{selected.title}</h2><div className="knowledge-map-concept"><div><span>WHAT YOU WILL LEARN</span><p>{selected.short}</p></div><div><span>WHY IT MATTERS</span><p>{selected.why}</p></div></div><div className="knowledge-map-detail-progress">{nodeStatus(selected, progress).doneCount} of {selected.lessonIds.length} lessons complete</div><div className="learning-lesson-list">{selectedLessons.map((lesson) => {
      const done = progress.completedLessons.includes(lesson.id)
      const available = isLessonAvailable(lesson.id, progress.completedLessons, progress.bossChallengeProgress)
      return <button className="learning-lesson-row" key={lesson.id} onClick={() => onOpenLesson(lesson.id)} disabled={!available && !done}><span className="learning-lesson-state">{done ? <CheckCircle2 size={17} /> : available ? <Circle size={17} /> : <LockKeyhole size={15} />}</span><span className="learning-lesson-info"><strong>{lesson.title}</strong><small>{lesson.objective}</small></span><ArrowRight size={15} /></button>
    })}</div><div className="knowledge-map-prerequisites"><span className="micro-label">BUILDS ON</span>{selected.prerequisiteNodeIds.length ? selected.prerequisiteNodeIds.map((id) => <button className="text-button" key={id} onClick={() => setSelectedId(id)}>{courseMapNodes.find((node) => node.id === id)?.title ?? id}<ArrowRight size={13} /></button>) : <span>Starting point</span>}</div></>}</aside></div>
  </>
}

interface BossChallengePageProps {
  progress: ProgressData
  onToggleTask: (bossId: string, taskId: string) => void
  onComplete: (bossId: string) => void
  onOpenLesson: (id: string) => void
  onNavigateProjects: () => void
}

function BossCard({ boss, progress, onToggleTask, onComplete, onOpenLesson, onNavigateProjects }: BossChallengePageProps & { boss: BossChallenge }) {
  const state = progress.bossChallengeProgress[boss.id] ?? { completedTasks: [], completed: false }
  const readyLessons = boss.requiredLessonIds.filter((id) => progress.completedLessons.includes(id))
  const requiredComplete = readyLessons.length === boss.requiredLessonIds.length
  const tasksComplete = boss.tasks.every((task) => state.completedTasks.includes(task.id))
  const project = boss.projectId ? projects.find((item) => item.id === boss.projectId) : undefined
  return <article className="project-card boss-challenge-card"><div className="project-card-head"><div><div className="eyebrow">MONTH {String(boss.month).padStart(2, '0')} · MILESTONE CHALLENGE</div><h2>{boss.title}</h2><p>{boss.subtitle}</p></div><div className="project-progress-circle"><strong>{lessonPercent(state.completedTasks.length, boss.tasks.length)}%</strong><span>{state.completed ? 'PASSED' : 'STEPS'}</span></div></div><div className="boss-mission"><span className="micro-label">THE MISSION</span><p>{boss.mission}</p></div><div className="project-tech">{boss.skills.map((skill) => <Tag key={skill}>{skill}</Tag>)}</div><div className="boss-gate"><div><strong>Prerequisite lessons</strong><span>{readyLessons.length} / {boss.requiredLessonIds.length} complete</span></div><div className="learning-lesson-list">{boss.requiredLessonIds.map((id) => {
    const lesson = lessons.find((entry) => entry.id === id)
    const done = progress.completedLessons.includes(id)
    if (!lesson) return null
    return <button className={`boss-prerequisite${done ? ' complete' : ''}`} key={id} onClick={() => onOpenLesson(id)}><span>{done ? <CheckCircle2 size={15} /> : <Circle size={15} />}</span><strong>{lesson.title}</strong><ArrowRight size={13} /></button>
  })}</div></div><div className="boss-task-list"><div className="eyebrow">CHALLENGE STEPS · {state.completedTasks.length}/{boss.tasks.length}</div>{boss.tasks.map((task, index) => {
    const checked = state.completedTasks.includes(task.id)
    return <button className={`weekly-check boss-task${checked ? ' checked' : ''}`} key={task.id} onClick={() => !state.completed && onToggleTask(boss.id, task.id)} disabled={state.completed}><span>{checked ? <CheckCircle2 size={18} /> : <Circle size={18} />}</span><strong><span className="boss-task-index">{String(index + 1).padStart(2, '0')}</span>{task.title}<small>{task.detail}</small></strong></button>
  })}</div><details className="boss-hints"><summary><Sparkles size={14} /> Need a hint?</summary><ul>{boss.hints.map((hint) => <li key={hint}>{hint}</li>)}</ul></details><div className="boss-deliverable"><span className="micro-label">DELIVERABLE</span><p>{boss.deliverable}</p></div>{project && <button className="button button-outline" onClick={onNavigateProjects}><FolderKanban size={14} /> Connect this to {project.title}</button>}<div className="boss-complete-row"><span>{state.completed ? 'Challenge complete. Your milestone is recorded.' : !requiredComplete ? 'Complete the prerequisite lessons to unlock completion.' : !tasksComplete ? 'Check off every step after you have produced its evidence.' : 'All prerequisites and steps are complete.'}</span><button className={`button ${state.completed ? 'button-quiet' : 'button-primary'}`} onClick={() => !state.completed && requiredComplete && tasksComplete && onComplete(boss.id)} disabled={state.completed || !requiredComplete || !tasksComplete}>{state.completed ? <><CheckCircle2 size={14} /> Completed</> : <>Complete challenge <Award size={14} /></>}</button></div></article>
}

export function BossChallengePage(props: BossChallengePageProps) {
  const completedLessons = lessons.filter((lesson) => props.progress.completedLessons.includes(lesson.id)).length
  const completedProjectTasks = projects.reduce((sum, project) => sum + (props.progress.projectProgress[project.id] ?? []).filter((id) => project.tasks.some((task) => task.id === id)).length, 0)
  const totalProjectTasks = projects.reduce((sum, project) => sum + project.tasks.length, 0)
  const completedCheckpoints = bossChallenges.filter((boss) => props.progress.bossChallengeProgress[boss.id]?.completed).length
  const certificateReady = completedLessons === lessons.length && completedProjectTasks === totalProjectTasks && completedCheckpoints === bossChallenges.length
  return <><PageIntro eyebrow="PRACTICE MILESTONES" title="Prove you can apply the ideas." description="Boss challenges combine several lessons into a work-like deliverable. Check off a step only when you have created its evidence." /><div className="boss-challenge-intro panel"><Award size={20} /><div><strong>Completion requires both the prerequisite lessons and the challenge evidence.</strong><span>These are course milestones, not official SAP certifications.</span></div></div><div className="boss-challenge-stack">{bossChallenges.map((boss) => <BossCard {...props} boss={boss} key={boss.id} />)}</div><section className={`course-certificate panel${certificateReady ? ' certificate-ready' : ''}`}><div className="certificate-heading"><Award size={21} /><div><span className="eyebrow">YOUR FINAL MILESTONE</span><h2>Course completion certificate</h2><p>Requirements are checked against saved lesson, project, and checkpoint progress.</p></div></div><div className="certificate-requirements"><div className={completedLessons === lessons.length ? 'requirement-met' : ''}><CheckCircle2 size={16} /><span>Lessons</span><strong>{completedLessons}/{lessons.length}</strong></div><div className={completedProjectTasks === totalProjectTasks ? 'requirement-met' : ''}><CheckCircle2 size={16} /><span>Project tasks</span><strong>{completedProjectTasks}/{totalProjectTasks}</strong></div><div className={completedCheckpoints === bossChallenges.length ? 'requirement-met' : ''}><CheckCircle2 size={16} /><span>Course checkpoints</span><strong>{completedCheckpoints}/{bossChallenges.length}</strong></div></div>{certificateReady ? <div className="certificate-document"><span>NORTHSTAR LEARNING SYSTEM</span><h3>Certificate of Completion</h3><p>This recognizes</p><strong>Khoa</strong><p>for completing the six-month SAP ABAP Junior Learning Journey, including its course checkpoints and portfolio projects.</p><small>Course Completion Certificate — not an SAP certification.</small><button className="button button-primary" onClick={() => window.print()}><Award size={14} /> Print certificate</button></div> : <div className="certificate-locked"><LockKeyhole size={17} /><span>Finish every lesson, project task, and course checkpoint to unlock your internal certificate.</span></div>}</section></>
}

export function ReviewStudio({ progress, onRate, onOpenLesson }: { progress: ProgressData; onRate: (cardId: string, rating: ReviewRating) => void; onOpenLesson: (id: string) => void }) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const now = Date.now()
  const orderedCards = useMemo(() => reviewCards.filter((card) => progress.completedLessons.includes(card.lessonId)).sort((a, b) => {
    const aState = progress.reviewCards[a.id]
    const bState = progress.reviewCards[b.id]
    const aDue = aState ? new Date(aState.nextReviewAt).getTime() : 0
    const bDue = bState ? new Date(bState.nextReviewAt).getTime() : 0
    return aDue - bDue
  }), [progress.completedLessons, progress.reviewCards])
  const activeCard = activeCardId ? orderedCards.find((card) => card.id === activeCardId) : orderedCards.find((card) => !progress.reviewCards[card.id] || new Date(progress.reviewCards[card.id].nextReviewAt).getTime() <= now)
  const dueCount = orderedCards.filter((card) => !progress.reviewCards[card.id] || new Date(progress.reviewCards[card.id].nextReviewAt).getTime() <= now).length
  const ratedCount = orderedCards.filter((card) => Boolean(progress.reviewCards[card.id])).length
  const state = activeCard ? progress.reviewCards[activeCard.id] : undefined

  function rate(rating: ReviewRating) {
    if (!activeCard) return
    onRate(activeCard.id, rating)
    const currentIndex = orderedCards.findIndex((card) => card.id === activeCard.id)
    const next = orderedCards.slice(currentIndex + 1).find((card) => {
      const cardState = progress.reviewCards[card.id]
      return !cardState || new Date(cardState.nextReviewAt).getTime() <= now
    }) ?? orderedCards.slice(0, currentIndex).find((card) => {
      const cardState = progress.reviewCards[card.id]
      return !cardState || new Date(cardState.nextReviewAt).getTime() <= now
    })
    setActiveCardId(next?.id ?? null)
    setRevealed(false)
  }

  return <>
    <PageIntro eyebrow="SPACED REVIEW" title="Recall first. Then check." description="Rate how easily you could retrieve each answer. Your review schedule uses those ratings to bring difficult ideas back sooner." />
    <div className="weekly-progress-card review-studio-summary"><div><span className="eyebrow">TODAY'S REVIEW QUEUE</span><h2>{dueCount ? `${dueCount} cards ready` : 'No cards due right now'}</h2><p>{ratedCount} of {orderedCards.length} cards have a saved review rating.</p></div><div className="weekly-score"><strong>{dueCount}<small> due</small></strong><ProgressBar value={lessonPercent(ratedCount, orderedCards.length)} compact /></div></div>
    {activeCard ? <div className="review-studio-layout"><section className="panel review-studio-card"><div className="review-card-top"><div><div className="eyebrow">RETRIEVAL CARD</div><div className="topic-chips">{activeCard.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</div></div><span className="review-due-label">{state ? new Date(state.nextReviewAt).getTime() <= now ? 'DUE NOW' : `NEXT · ${new Date(state.nextReviewAt).toLocaleDateString()}` : 'NEW'}</span></div><h2>{activeCard.prompt}</h2>{revealed ? <div className="review-answer-reveal"><span className="micro-label">A STRONG ANSWER</span><p>{activeCard.answer}</p></div> : <div className="review-answer-prompt"><BookOpen size={16} /><span>Say or write your answer from memory before revealing the reference.</span></div>}<div className="review-card-actions">{!revealed ? <button className="button button-primary" onClick={() => setRevealed(true)}>Reveal answer <ChevronDown size={14} /></button> : <><button className="button button-outline" onClick={() => rate('hard')}>Hard · review soon</button><button className="button button-outline" onClick={() => rate('review')}>Need review</button><button className="button button-primary" onClick={() => rate('easy')}>Easy · got it <Check size={14} /></button></>}</div><button className="text-button" onClick={() => onOpenLesson(activeCard.lessonId)}><BookOpen size={13} /> Reopen related lesson <ArrowRight size={13} /></button></section><aside className="panel review-studio-side"><div className="eyebrow">UP NEXT</div><h3>Review queue</h3><div className="review-queue">{orderedCards.map((card) => {
      const cardState = progress.reviewCards[card.id]
      const cardDue = !cardState || new Date(cardState.nextReviewAt).getTime() <= now
      return <button className={`review-queue-item${activeCard.id === card.id ? ' active' : ''}`} key={card.id} onClick={() => { setActiveCardId(card.id); setRevealed(false) }}><span className={cardDue ? 'queue-dot due' : 'queue-dot'}>{cardDue ? <Circle size={9} /> : <Check size={9} />}</span><span><strong>{card.prompt}</strong><small>{card.tags.join(' · ')}</small></span>{activeCard.id === card.id && <ChevronRight size={14} />}</button>
    })}</div></aside></div> : <div className="empty-state"><CheckCircle2 size={24} /><strong>{orderedCards.length ? 'You are up to date.' : 'Complete a lesson to start your review deck.'}</strong><span>{orderedCards.length ? 'Your saved cards are scheduled for another day. You can return when they are due.' : 'Recall cards unlock as you complete the lessons they belong to.'}</span></div>}
  </>
}
