interface Props { value: number; label?: string; compact?: boolean }
export function ProgressBar({ value, label, compact = false }: Props) {
  const safe = Math.max(0, Math.min(100, value))
  return <div className={`progress-wrap${compact ? ' compact' : ''}`}>
    {label && <div className="progress-label"><span>{label}</span><strong>{safe}%</strong></div>}
    <div className="progress-track" role="progressbar" aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'Progress'}><span style={{ width: `${safe}%` }} /></div>
  </div>
}
