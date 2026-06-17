import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export interface GlobalSearchResults {
  tasks: Array<{ id: string; title: string; project_id: string; due_date: string | null; status: string }>
  problems: Array<{ id: string; title: string; problem_number: number | null; next_review_date: string; status: string }>
  bugs: Array<{ id: string; title: string; language: string | null }>
  notes: Array<{ id: string; title: string; category: string }>
}

interface Props {
  open: boolean
  query: string
  onQueryChange: (next: string) => void
  loading: boolean
  results: GlobalSearchResults
  onClose: () => void
}

function GlobalSearchModal({ open, query, onQueryChange, loading, results, onClose }: Props) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const hasAnyResults = useMemo(() => {
    return results.tasks.length + results.problems.length + results.bugs.length + results.notes.length > 0
  }, [results])

  if (!open) return null

  const go = (path: string) => {
    onClose()
    navigate(path)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal global-search-modal" onClick={e => e.stopPropagation()}>
        <div className="global-search-header">
          <h2>Search DevVault</h2>
          <button className="global-search-close" onClick={onClose}>✕</button>
        </div>

        <input
          ref={inputRef}
          className="global-search-input"
          placeholder="Search tasks, problems, bugs, notes..."
          value={query}
          onChange={e => onQueryChange(e.target.value)}
        />

        {query.trim().length === 0 ? (
          <div className="global-search-hint">
            Try: project name, error message, LeetCode problem title, or a note keyword
          </div>
        ) : loading ? (
          <div className="global-search-hint">Searching…</div>
        ) : !hasAnyResults ? (
          <div className="global-search-hint">No results found</div>
        ) : (
          <div className="global-search-results">
            {results.tasks.length > 0 && (
              <div className="global-search-group">
                <div className="global-search-group-title">SprintBoard</div>
                {results.tasks.map(t => (
                  <button
                    key={t.id}
                    className="global-search-item"
                    onClick={() => go(`/sprintboard?project=${t.project_id}&task=${t.id}`)}
                  >
                    <span className="global-search-item-title">{t.title}</span>
                    <span className="global-search-item-meta">
                      {t.status}{t.due_date ? ` • due ${t.due_date}` : ''}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {results.problems.length > 0 && (
              <div className="global-search-group">
                <div className="global-search-group-title">MockMate</div>
                {results.problems.map(p => (
                  <button
                    key={p.id}
                    className="global-search-item"
                    onClick={() => go(`/mockmate?problem=${p.id}`)}
                  >
                    <span className="global-search-item-title">
                      {p.problem_number ? `#${p.problem_number} ` : ''}{p.title}
                    </span>
                    <span className="global-search-item-meta">
                      {p.status} • review {p.next_review_date}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {results.bugs.length > 0 && (
              <div className="global-search-group">
                <div className="global-search-group-title">BugVault</div>
                {results.bugs.map(b => (
                  <button
                    key={b.id}
                    className="global-search-item"
                    onClick={() => go(`/bugvault?bug=${b.id}`)}
                  >
                    <span className="global-search-item-title">{b.title}</span>
                    <span className="global-search-item-meta">
                      {b.language ? b.language : 'Unknown'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {results.notes.length > 0 && (
              <div className="global-search-group">
                <div className="global-search-group-title">TechNotes</div>
                {results.notes.map(n => (
                  <button
                    key={n.id}
                    className="global-search-item"
                    onClick={() => go(`/technotes/${n.id}`)}
                  >
                    <span className="global-search-item-title">{n.title}</span>
                    <span className="global-search-item-meta">{n.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GlobalSearchModal
