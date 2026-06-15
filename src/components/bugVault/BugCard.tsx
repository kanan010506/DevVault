import { useState } from 'react'
import type { Bug } from './types'
import {getLastSeen} from './utils.ts'

interface Props {
  bug: Bug
  onEdit: (bug: Bug) => void
  onDelete: (id: string) => void
  onSawAgain: (id: string) => void
}

function BugCard({ bug, onEdit, onDelete, onSawAgain }: Props) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!bug.code_snippet) return
    navigator.clipboard.writeText(bug.code_snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`bug-card ${expanded ? 'expanded' : ''}`}>
      <div className="bug-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="bug-card-title">
          <span className="bug-expand-icon">{expanded ? '▼' : '▶'}</span>
          <span className="bug-title">{bug.title}</span>
          {bug.language && <span className="bug-language">{bug.language}</span>}
          {bug.hit_count > 1 && (
            <span className="bug-hit-count" title={`Seen ${bug.hit_count} times`}>
              🔁 {bug.hit_count}×
            </span>
          )}
        </div>
        <div className="bug-card-actions">
          <button className="mm-edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(bug) }}>✏️</button>
          <button className="mm-delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(bug.id) }}>🗑️</button>
        </div>
      </div>

      {expanded && (
        <>
          {bug.error_message && (
            <div className="bug-error">
              <pre>{bug.error_message}</pre>
            </div>
          )}

          {(bug.cause || bug.solution) && (
            <div className="bug-fix-preview">
              {bug.cause && (
                <p><span className="bug-fix-label">Cause:</span> {bug.cause}</p>
              )}
              {bug.solution && (
                <p><span className="bug-fix-label">Fix:</span> {bug.solution}</p>
              )}
            </div>
          )}

          {bug.code_snippet && (
            <details className="bug-code-details" onClick={e => e.stopPropagation()}>
              <summary>
                💻 View code ({bug.code_language})
              </summary>
              <div className="bug-code-wrapper">
                <button className="bug-copy-btn" onClick={handleCopy}>
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
                <pre className="fc-code">{bug.code_snippet}</pre>
              </div>
            </details>
          )}

          {bug.tags && bug.tags.length > 0 && (
            <div className="problem-tags">
              {bug.tags.map(tag => (
                <span key={tag} className="problem-tag">#{tag}</span>
              ))}
            </div>
          )}

          <div className="bug-card-footer">
            <span className="bug-last-seen">{getLastSeen(bug.last_seen_at)}</span>
            <button className="bug-saw-again-btn" onClick={(e) => { e.stopPropagation(); onSawAgain(bug.id) }}>
              🔁 Saw this again
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default BugCard