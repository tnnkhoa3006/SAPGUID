import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronDown, ChevronRight, Circle, Code2, Eye, Lightbulb, Lock, MessageSquare, Play, RotateCcw, Sparkles, Target, Trophy } from 'lucide-react'
import type { Lesson, LessonStage, ProgressData } from '../types'
import { lessons, months } from '../data/curriculum'
import { getLessonExperience, isLessonAvailable } from '../data/learningExperience'
import { CodeBlock } from './CodeBlock'

type RunResult = { success: boolean; output: string }

const tabs: { id: LessonStage; label: string; icon: typeof Sparkles }[] = [
  { id: 'learn', label: 'Learn', icon: Sparkles },
  { id: 'see', label: 'See it', icon: Eye },
  { id: 'try', label: 'Try it', icon: Code2 },
  { id: 'check', label: 'Check', icon: Target },
  { id: 'apply', label: 'Apply', icon: Trophy },
]

interface Props {
  lesson: Lesson
  progress: ProgressData
  onOpenLesson: (id: string) => void
  onBack: () => void
  onComplete: (id: string) => void
  onScore: (id: string, score: number) => void
  onStageDone: (id: string, stage: LessonStage) => void
  onSaveNote: (id: string, note: string) => void
  onSaveAttempt: (id: string, attempt: ProgressData['playgroundAttempts'][string]) => void
  onNavigateProjects: () => void
  onNext: () => void
  onPrevious: () => void
}

function simulateAbap(code: string, requiredTokens: string[], expectedOutput: string): RunResult {
  const missing = requiredTokens.filter((token) => !code.toLowerCase().includes(token.toLowerCase()))
  const assignment = code.match(/\b(lv_[a-z0-9_]+)\s*=\s*'([^']+)'/i)
  const assignedName = assignment?.[1] ?? ''
  const assignedValue = assignment?.[2] ?? ''
  const hasWrite = /\bWRITE\b/i.test(code)
  if (!missing.length && assignedValue && hasWrite) {
    const template = code.match(/\bWRITE\b[\s\S]*?\|([^|]*)\|/i)?.[1]
    const output = template
      ? template.replace(new RegExp(`\\{\\s*${assignedName}\\s*\\}`, 'i'), assignedValue)
      : assignedValue
    return { success: true, output: `Output\n${output}\n\nExercise shape looks correct. Expected output: ${expectedOutput.replace('{name}', assignedValue)}` }
  }
  const advice = missing.length ? `Add: ${missing.join(', ')}.` : !assignedValue ? 'Assign a quoted value to an lv_ variable.' : 'Keep a WRITE statement so the report has visible output.'
  return { success: false, output: `Simulation feedback\n${advice}\n\nThis is a learning simulator, not an ABAP runtime.` }
}

function normalise(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[.?!]/g, '')
}

export function CoursePlayer({ lesson, progress, onOpenLesson, onBack, onComplete, onScore, onStageDone, onSaveNote, onSaveAttempt, onNavigateProjects, onNext, onPrevious }: Props) {
  const experience = useMemo(() => getLessonExperience(lesson), [lesson])
  const [tab, setTab] = useState<LessonStage>('learn')
  const [expandedMonths, setExpandedMonths] = useState<Record<number, boolean>>({ [lesson.month]: true })
  const [code, setCode] = useState(experience.playground?.starterCode ?? lesson.example)
  const [runResult, setRunResult] = useState<RunResult | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [challengeDone, setChallengeDone] = useState(false)
  const [choice, setChoice] = useState<number | null>(null)
  const [ordered, setOrdered] = useState<string[]>([])
  const [prediction, setPrediction] = useState('')
  const [checkResult, setCheckResult] = useState<boolean | null>(null)

  useEffect(() => {
    setTab('learn')
    setExpandedMonths({ [lesson.month]: true })
    setCode(progress.playgroundAttempts[lesson.id]?.code || experience.playground?.starterCode || lesson.example)
    setRunResult(null)
    setShowHints(false)
    setShowSolution(false)
    setChallengeDone(false)
    setChoice(null)
    setOrdered([])
    setPrediction('')
    setCheckResult(null)
  }, [lesson.id])

  const stageDone = progress.lessonStages[lesson.id] ?? []
  const allComplete = progress.completedLessons.includes(lesson.id)
  const check = experience.check
  const relatedLessons = experience.relatedLessonIds.map((id) => lessons.find((item) => item.id === id)).filter((item): item is Lesson => Boolean(item))
  const previousIndex = lessons.findIndex((item) => item.id === lesson.id)
  const previousLesson = previousIndex > 0 ? lessons[previousIndex - 1] : undefined
  const nextLesson = previousIndex < lessons.length - 1 ? lessons[previousIndex + 1] : undefined

  function openTab(next: LessonStage) {
    setTab(next)
    onStageDone(lesson.id, next)
  }

  function runPlayground() {
    const playground = experience.playground
    if (!playground) return
    const result = simulateAbap(code, playground.requiredTokens, playground.expectedOutput)
    setRunResult(result)
    onSaveAttempt(lesson.id, {
      code,
      runs: (progress.playgroundAttempts[lesson.id]?.runs ?? 0) + 1,
      lastOutput: result.output,
      completed: result.success || progress.playgroundAttempts[lesson.id]?.completed === true,
    })
    onStageDone(lesson.id, 'try')
  }

  function resetPlayground() {
    const starter = experience.playground?.starterCode ?? lesson.example
    setCode(starter)
    setRunResult(null)
  }

  function verifyCheck() {
    if (!check) return
    let correct = false
    if (check.kind === 'choice') correct = choice === check.answer
    if (check.kind === 'order') correct = Array.isArray(check.answer) && ordered.join('|') === check.answer.join('|')
    if (check.kind === 'predict') correct = typeof check.answer === 'string' && normalise(prediction) === normalise(check.answer)
    setCheckResult(correct)
    onScore(lesson.id, correct ? 100 : 0)
    onStageDone(lesson.id, 'check')
  }

  function completeCurrentLesson() {
    onComplete(lesson.id)
  }

  const completeStages = allComplete ? tabs.length : stageDone.length

  return <div className="course-player">
    <div className="player-topline">
      <button className="text-button player-back" onClick={onBack}><ArrowLeft size={15} /> Course workspace</button>
      <div className="player-meta"><span>MONTH {lesson.month}</span><i /> <span>WEEK {String(lesson.week).padStart(2, '0')}</span><i /> <span>{lesson.duration} MIN</span></div>
      <span className={`player-complete-state${allComplete ? ' complete' : ''}`}>{allComplete ? <><CheckCircle2 size={15} /> Complete</> : `${completeStages}/${tabs.length} steps explored`}</span>
    </div>

    <div className="player-title-row">
      <div><span className="eyebrow">{experience.hook.eyebrow}</span><h1>{lesson.title}</h1><p>{experience.hook.setup}</p></div>
      <div className="player-topic-chips">{lesson.topics.slice(0, 3).map((topic) => <span className="chip" key={topic}>{topic}</span>)}</div>
    </div>

    <nav className="player-stage-tabs" aria-label="Lesson stages">
      {tabs.map(({ id, label, icon: Icon }) => <button key={id} className={`${tab === id ? 'active' : ''}${stageDone.includes(id) || allComplete ? ' done' : ''}`} onClick={() => openTab(id)}><span>{stageDone.includes(id) || allComplete ? <Check size={14} /> : <Icon size={14} />}</span>{label}</button>)}
    </nav>

    <div className="player-layout">
      <aside className="player-outline" aria-label="Course outline">
        <div className="outline-heading"><div><span className="micro-label">COURSE OUTLINE</span><strong>40 lessons · 6 months</strong></div><span className="outline-progress">{Math.round(progress.completedLessons.length / lessons.length * 100)}%</span></div>
        <div className="outline-scroll">{months.map((month) => {
          const monthLessons = lessons.filter((item) => item.month === month.month)
          const monthCompleted = monthLessons.filter((item) => progress.completedLessons.includes(item.id)).length
          const isOpen = expandedMonths[month.month] ?? month.month === lesson.month
          return <section className="outline-month" key={month.month}>
            <button className="outline-month-toggle" onClick={() => setExpandedMonths((current) => ({ ...current, [month.month]: !isOpen }))}><span className={`outline-month-dot ${month.color}`} /><span><small>MONTH {month.month}</small><strong>{month.title}</strong></span><em>{monthCompleted}/{monthLessons.length}</em>{isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</button>
            {isOpen && <div className="outline-lessons">{monthLessons.map((item) => {
              const done = progress.completedLessons.includes(item.id)
              const available = isLessonAvailable(item.id, progress.completedLessons, progress.bossChallengeProgress)
              const active = item.id === lesson.id
              return <button key={item.id} disabled={!available && !active} className={`${active ? 'active' : ''}${done ? ' complete' : ''}${!available && !active ? ' locked' : ''}`} onClick={() => onOpenLesson(item.id)}><span>{done ? <Check size={13} /> : !available ? <Lock size={11} /> : String(item.week).padStart(2, '0')}</span><div><strong>{item.title}</strong><small>{item.type} · {item.duration} min</small></div></button>
            })}</div>}
          </section>
        })}</div>
      </aside>

      <main className="player-lesson" aria-live="polite">
        {tab === 'learn' && <section className="lesson-stage stage-learn">
          <div className="lesson-question-card"><span className="lesson-question-icon"><Sparkles size={20} /></span><div><span className="micro-label">START WITH THE REAL QUESTION</span><h2>{experience.hook.question}</h2><p>{experience.hook.setup}</p></div></div>
          <div className="objective-grid">{experience.objectives.map((objective, index) => <div key={objective}><span>{String(index + 1).padStart(2, '0')}</span><p>{objective}</p></div>)}</div>
          <article className="lesson-reading-card"><span className="micro-label">THE CONCEPT</span><h2>{lesson.concept}</h2><p>{lesson.explanation}</p><div className="beginner-note"><Lightbulb size={18} /><div><strong>{experience.beginner.analogy}</strong><p>{experience.beginner.explanation}</p></div></div></article>
          <article className="common-mistakes-card"><div><span className="micro-label">COMMON MISTAKES</span><h2>Catch these before they become habits.</h2></div><div>{experience.commonMistakes.map((item) => <section key={item.mistake}><strong>{item.mistake}</strong><p>{item.why}</p></section>)}</div></article>
          <article className="deep-dive-card"><div><span className="micro-label">GO ONE LAYER DEEPER</span><h2>{experience.deepDive.title}</h2></div><p>{experience.deepDive.content}</p></article>
          <button className="button button-primary player-next-stage" onClick={() => openTab('see')}>See the workflow <ArrowRight size={15} /></button>
        </section>}

        {tab === 'see' && <section className="lesson-stage stage-see">
          {experience.visual && <article className="lesson-visual"><div><span className="micro-label">MENTAL MODEL</span><h2>{experience.visual.title}</h2><p>{experience.visual.caption}</p></div><div className="visual-flow">{experience.visual.nodes.map((node, index) => <div className={`visual-node ${node.tone ?? 'mint'}`} key={node.label}><span>{String(index + 1).padStart(2, '0')}</span><strong>{node.label}</strong><small>{node.detail}</small>{index < experience.visual!.nodes.length - 1 && <i><ArrowRight size={15} /></i>}</div>)}</div></article>}
          <article className="real-world-card"><div className="real-world-heading"><span className="real-world-icon"><MessageSquare size={18} /></span><div><span className="micro-label">{experience.realWorld.title.toUpperCase()}</span><h2>{experience.realWorld.ticket}</h2></div></div><ol>{experience.realWorld.workflow.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span>{step}</li>)}</ol><footer><strong>Takeaway</strong><p>{experience.realWorld.takeaway}</p></footer></article>
          <article className="example-card"><div><span className="micro-label">READ THE EXAMPLE</span><h2>What the code is trying to do</h2><p>{lesson.explanation}</p></div><CodeBlock code={experience.playground?.starterCode ?? lesson.example} />{experience.codeNotes && <div className="code-notes">{experience.codeNotes.map((note) => <div key={note.token}><code>{note.token}</code><span>{note.explanation}</span></div>)}</div>}</article>
          <button className="button button-primary player-next-stage" onClick={() => openTab('try')}>Try it yourself <ArrowRight size={15} /></button>
        </section>}

        {tab === 'try' && <section className="lesson-stage stage-try">
          <div className="practice-heading"><div><span className="micro-label">GUIDED PRACTICE</span><h2>Build the idea one deliberate step at a time.</h2></div><span className="practice-time">~ {Math.max(10, Math.round(lesson.duration * .55))} min</span></div>
          <div className="guided-steps">{experience.guidedPractice.map((step, index) => <article key={step.title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{step.title}</h3><p>{step.detail}</p></div></article>)}</div>
          {experience.playground ? <article className="playground-card">
            <div className="playground-heading"><div><span className="micro-label">ABAP PRACTICE SANDBOX</span><h2>Change the code, then run the exercise.</h2><p>{experience.playground.instructions.join(' ')}</p></div><span className="sandbox-badge"><Code2 size={14} /> Simulated</span></div>
            <div className="expected-output"><span className="micro-label">EXPECTED OUTPUT</span><code>{experience.playground.expectedOutput.replace('{name}', 'Khoa')}</code></div>
            <textarea className="code-editor" value={code} onChange={(event) => setCode(event.target.value)} spellCheck={false} aria-label="ABAP practice code" />
            <div className="playground-actions"><button className="button button-primary" onClick={runPlayground}><Play size={14} /> Run simulation</button><button className="button button-quiet" onClick={resetPlayground}><RotateCcw size={14} /> Reset</button><button className="text-button" onClick={() => setShowHints((current) => !current)}><Lightbulb size={14} /> {showHints ? 'Hide hints' : 'Show hints'}</button></div>
            {showHints && <ul className="playground-hints">{experience.playground.hints.map((hint) => <li key={hint}>{hint}</li>)}</ul>}{runResult && <pre className={`playground-output${runResult.success ? ' success' : ' needs-work'}`}>{runResult.output}</pre>}
          </article> : <article className="workbench-card"><Code2 size={22} /><div><span className="micro-label">YOUR WORKBENCH</span><h2>Use your ABAP system for the practical rep.</h2><p>{lesson.exercise}</p></div><CodeBlock code={lesson.example} /></article>}
          <article className={`challenge-card player-challenge${challengeDone ? ' challenge-done' : ''}`}><div className="challenge-head"><span><Trophy size={17} /></span><div><span className="micro-label">CHALLENGE</span><h2>{experience.challenge.title}</h2></div>{challengeDone && <CheckCircle2 size={20} />}</div><p>{experience.challenge.prompt}</p><div className="challenge-actions"><button className="button button-outline" onClick={() => setShowHints((current) => !current)}><Lightbulb size={14} /> Need a hint?</button><button className="button button-quiet" onClick={() => setShowSolution((current) => !current)}>{showSolution ? 'Hide approach' : 'Compare approach'}</button><button className="button button-primary" onClick={() => { setChallengeDone(true); onStageDone(lesson.id, 'try') }}><Check size={14} /> I attempted it</button></div>{showHints && <ul className="challenge-hints">{experience.challenge.hints.map((hint) => <li key={hint}>{hint}</li>)}</ul>}{showSolution && <div className="challenge-solution"><strong>One sound approach</strong><p>{experience.challenge.solution}</p><small>{experience.challenge.success}</small></div>}</article>
          <button className="button button-primary player-next-stage" onClick={() => openTab('check')}>Check your understanding <ArrowRight size={15} /></button>
        </section>}

        {tab === 'check' && <section className="lesson-stage stage-check">
          <div className="check-heading"><span><Target size={20} /></span><div><span className="micro-label">RETRIEVAL, NOT REREADING</span><h2>Answer without looking back first.</h2><p>A wrong answer is a useful signal for the review queue.</p></div></div>
          {check ? <article className="knowledge-check"><span className="question-index">01</span><h3>{check.prompt}</h3>{check.kind === 'choice' && <div className="check-options">{check.options?.map((option, index) => <button key={option} className={`${choice === index ? 'selected' : ''}${checkResult !== null && index === check.answer ? ' correct-answer' : ''}`} onClick={() => { setChoice(index); setCheckResult(null) }}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>}{check.kind === 'order' && <div className="order-check"><p>Click each step in the order you think is correct.</p><div className="order-selected">{ordered.length ? ordered.map((item, index) => <button key={item} onClick={() => { setOrdered((items) => items.filter((_, itemIndex) => itemIndex !== index)); setCheckResult(null) }}><span>{index + 1}</span>{item}<small>Remove</small></button>) : <span className="order-empty">Your sequence will appear here.</span>}</div><div className="order-options">{check.options?.filter((item) => !ordered.includes(item)).map((item) => <button key={item} onClick={() => { setOrdered((items) => [...items, item]); setCheckResult(null) }}>{item}<ArrowRight size={14} /></button>)}</div></div>}{check.kind === 'predict' && <label className="prediction-input"><span>YOUR PREDICTION</span><input value={prediction} onChange={(event) => { setPrediction(event.target.value); setCheckResult(null) }} placeholder="Type the output or answer" /></label>}<button className="button button-primary verify-check" onClick={verifyCheck} disabled={check.kind === 'choice' ? choice === null : check.kind === 'order' ? ordered.length !== (check.answer as string[]).length : !prediction.trim()}>Check answer <ArrowRight size={14} /></button>{checkResult !== null && <div className={`check-feedback${checkResult ? ' correct' : ' incorrect'}`}><span>{checkResult ? <CheckCircle2 size={20} /> : <Lightbulb size={20} />}</span><div><strong>{checkResult ? 'That is right.' : 'Keep the signal; now correct it.'}</strong><p>{check.explanation}</p></div></div>}</article> : <article className="knowledge-check"><h3>{lesson.checkpoints[0]}</h3><p>Answer it aloud, then write a short note in the lesson mission panel.</p><button className="button button-primary" onClick={() => { onStageDone(lesson.id, 'check'); setCheckResult(true) }}>I can explain this <Check size={14} /></button></article>}
          <article className="interview-mini"><span className="micro-label">SAY IT LIKE A TEAMMATE IS ASKING</span><p>{experience.interview?.question ?? `How would you explain ${lesson.topics[0]} in one clear minute?`}</p><button className="text-button" onClick={() => openTab('apply')}>Use the answer in your project <ArrowRight size={14} /></button></article>
        </section>}

        {tab === 'apply' && <section className="lesson-stage stage-apply">
          <div className="apply-heading"><span><Trophy size={21} /></span><div><span className="micro-label">MAKE IT STICK</span><h2>Connect this lesson to work you can show.</h2><p>{experience.nextReason}</p></div></div>
          {experience.projectConnection ? <article className="project-connection"><div><span className="micro-label">PORTFOLIO CONNECTION</span><h2>{experience.projectConnection.title}</h2><p>{experience.projectConnection.detail}</p></div><button className="button button-primary" onClick={onNavigateProjects}>Open project task <ArrowRight size={14} /></button></article> : <article className="project-connection neutral"><div><span className="micro-label">TRANSFER THE SKILL</span><h2>Use it in a small portfolio artifact.</h2><p>Write one project note, test case, or implementation choice that demonstrates this concept.</p></div></article>}
          <article className="summary-card"><span className="micro-label">TAKE WITH YOU</span><ul>{experience.summary.map((point) => <li key={point}><Check size={15} />{point}</li>)}</ul></article>
          <label className="reflection-card"><span className="micro-label">REFLECT BEFORE YOU COMPLETE</span><strong>What can you explain now that felt unfamiliar at the start?</strong><textarea value={progress.lessonNotes[lesson.id] ?? ''} onChange={(event) => onSaveNote(lesson.id, event.target.value)} placeholder="Write one insight, one question, or one thing you want to try in your project…" /><small>Your reflection is saved locally with this lesson.</small></label>
          {experience.interview && <article className="interview-apply"><span className="micro-label">INTERVIEW REP</span><h2>{experience.interview.question}</h2><div><strong>A strong answer includes</strong><p>{experience.interview.expected}</p></div><small>Watch for: {experience.interview.commonMistake}</small></article>}
          {relatedLessons.length > 0 && <article className="related-lessons"><span className="micro-label">KEEP BUILDING</span><div>{relatedLessons.map((item) => <button key={item.id} onClick={() => onOpenLesson(item.id)}><span>{item.type}</span><strong>{item.title}</strong><ArrowRight size={15} /></button>)}</div></article>}
          <button className={`button ${allComplete ? 'button-quiet' : 'button-primary'} complete-lesson-button`} onClick={completeCurrentLesson}>{allComplete ? <><CheckCircle2 size={16} /> Lesson already complete</> : <><Check size={16} /> Complete this lesson</>}</button>
        </section>}
      </main>

      <aside className="player-mission">
        <div className="mission-card"><span className="micro-label">LESSON MISSION</span><h2>{lesson.objective}</h2><div className="mission-progress"><div><strong>{completeStages}</strong><span>of {tabs.length} stages</span></div><div className="mission-track"><i style={{ width: `${(completeStages / tabs.length) * 100}%` }} /></div></div><ul>{tabs.map(({ id, label, icon: Icon }) => <li className={stageDone.includes(id) || allComplete ? 'done' : ''} key={id}>{stageDone.includes(id) || allComplete ? <Check size={14} /> : <Icon size={14} />}<span>{label}</span></li>)}</ul></div>
        {experience.prerequisiteIds.length > 0 && <div className="mission-card prerequisites"><span className="micro-label">BUILT ON</span>{experience.prerequisiteIds.map((id) => { const item = lessons.find((entry) => entry.id === id); if (!item) return null; const complete = progress.completedLessons.includes(id); return <button key={id} onClick={() => onOpenLesson(id)}><span>{complete ? <Check size={13} /> : <Lock size={12} />}</span>{item.title}<ChevronRight size={13} /></button> })}</div>}
        <label className="mission-card lesson-notes"><span className="micro-label">YOUR NOTE</span><textarea value={progress.lessonNotes[lesson.id] ?? ''} onChange={(event) => onSaveNote(lesson.id, event.target.value)} placeholder="Write the one thing you want to remember…" /><small>Saved locally as you type.</small></label>
        <div className="mission-card lesson-checkpoints"><span className="micro-label">WHEN YOU FINISH</span>{lesson.checkpoints.map((checkpoint) => <p key={checkpoint}><Circle size={13} />{checkpoint}</p>)}</div>
      </aside>
    </div>

    <footer className="player-footer-nav">
      <button className="button button-quiet" onClick={onPrevious} disabled={!previousLesson}><ArrowLeft size={15} /> {previousLesson ? 'Previous lesson' : 'Start of course'}</button>
      {!allComplete && <button className="button button-primary" onClick={completeCurrentLesson}><Check size={15} /> Complete lesson</button>}
      <button className="button button-outline" onClick={onNext} disabled={!nextLesson}>{nextLesson ? <>Next lesson <ArrowRight size={15} /></> : <>Course complete <Trophy size={15} /></>}</button>
    </footer>
  </div>
}
