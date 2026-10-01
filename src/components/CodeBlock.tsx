import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CodeBlock({ code, language = 'ABAP' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1400) }
    catch { setCopied(false) }
  }
  return <div className="code-block">
    <div className="code-head"><span><i />{language}</span><button className="icon-button copy-button" onClick={copy} aria-label="Copy code">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy'}</button></div>
    <pre><code>{code}</code></pre>
  </div>
}
