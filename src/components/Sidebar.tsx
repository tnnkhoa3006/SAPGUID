import { BookOpen, CalendarDays, ChartNoAxesCombined, CircleHelp, FileBadge2, FolderKanban, GraduationCap, LayoutDashboard, Languages, Map, RefreshCcw, Settings2, Sparkles, Swords, Waypoints } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ProgressBar } from './ProgressBar'

export type View = 'dashboard' | 'roadmap' | 'course' | 'lesson' | 'map' | 'challenges' | 'review' | 'today' | 'weekly' | 'projects' | 'english' | 'certification' | 'interviews' | 'glossary' | 'settings'

const groups: { label: string; links: { id: View; title: string; icon: LucideIcon }[] }[] = [
  { label: 'LEARN', links: [{ id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard }, { id: 'course', title: 'Course player', icon: BookOpen }, { id: 'map', title: 'Course map', icon: Map }, { id: 'roadmap', title: 'Roadmap', icon: Waypoints }, { id: 'today', title: 'Today’s study', icon: CalendarDays }, { id: 'review', title: 'Review queue', icon: RefreshCcw }, { id: 'weekly', title: 'Weekly review', icon: ChartNoAxesCombined }] },
  { label: 'BUILD & PREPARE', links: [{ id: 'challenges', title: 'Boss challenges', icon: Swords }, { id: 'projects', title: 'Projects', icon: FolderKanban }, { id: 'english', title: 'English for SAP', icon: Languages }, { id: 'certification', title: 'Certification', icon: FileBadge2 }, { id: 'interviews', title: 'Interview practice', icon: CircleHelp }, { id: 'glossary', title: 'Glossary', icon: GraduationCap }] },
]

interface Props { active: View; onNavigate: (view: View) => void; progress: number; completed: number; total: number; open: boolean; onClose: () => void }
export function Sidebar({ active, onNavigate, progress, completed, total, open, onClose }: Props) {
  return <>
    {open && <button className="mobile-scrim" aria-label="Close navigation" onClick={onClose} />}
    <aside className={`sidebar${open ? ' sidebar-open' : ''}`} aria-label="Main navigation" aria-hidden={!open}>
      <div className="brand-row"><div className="brand-mark"><Sparkles size={18} strokeWidth={2.2} /></div><div className="brand-name">northstar<span>LEARNING SYSTEM</span></div></div>
      <div className="sidebar-profile"><div className="avatar">K</div><div><strong>Khoa’s journey</strong><span>ABAP Developer · 6 months</span></div><span className="online-dot" aria-label="Local profile" /></div>
      <nav id="main-navigation" className="sidebar-nav" aria-label="Learning sections">{groups.map((group) => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.links.map(({ id, title, icon: Icon }) => <button className={`nav-link${active === id || (id === 'course' && active === 'lesson') ? ' active' : ''}`} key={id} onClick={() => { onNavigate(id); onClose() }}><Icon size={17} strokeWidth={1.8} /><span>{title}</span>{id === 'today' && <span className="nav-spark">•</span>}</button>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="side-progress-title"><span>YOUR PROGRESS</span><strong>{progress}%</strong></div><ProgressBar value={progress} compact /><p>{completed} of {total} lessons complete</p><button className={`nav-link${active === 'settings' ? ' active' : ''}`} onClick={() => { onNavigate('settings'); onClose() }}><Settings2 size={17} /><span>Settings</span></button><div className="sidebar-foot">Built for steady progress <span>↗</span></div></div>
    </aside>
  </>
}
