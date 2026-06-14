import { useState } from 'react'
import type { Problem, MockMateSettings } from './types'
import { LANGUAGES } from './types'

interface Props {
  problems: Problem[]
  settings: MockMateSettings
  onComplete: (problemId: string, newDate: string, newStatus: Problem['status']) => void
  onExit: () => void
  onUpdateProblem: (problemId: string, notes: string, solution: string, solutionLanguage: string) => void
}

function addDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

function FlashcardReview({ problems, settings, onComplete, onExit, onUpdateProblem }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showNotes, setShowNotes] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<Problem['status']>('failed')
  const [done, setDone] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editNotes, setEditNotes] = useState('')
  const [editSolution, setEditSolution] = useState('')
  const [editLanguage, setEditLanguage] = useState('')

  const current = problems[currentIndex]

  const handleResult = (result: 'failed' | 'revisiting' | 'mastered') => {
    const intervals = {
      failed: settings.failed_interval,
      revisiting: settings.revisiting_interval,
      mastered: settings.mastered_interval,
    }
    setSelectedStatus(result)
    setSelectedDate(addDays(intervals[result]))
    setShowResult(true)
  }

  const handleConfirm = () => {
    onComplete(current.id, selectedDate, selectedStatus)
    if (currentIndex + 1 >= problems.length) {
      setDone(true)
    } else {
      setCurrentIndex(prev => prev + 1)
      setShowNotes(false)
      setShowSolution(false)
      setShowResult(false)
      setSelectedDate('')
      setIsEditing(false)
    }
  }

  const handleStartEdit = () => {
    setEditNotes(current.notes || '')
    setEditSolution(current.solution || '')
    setEditLanguage(current.solution_language || settings.preferred_language)
    setIsEditing(true)
    setShowNotes(true)
    setShowSolution(true)
  }

  const handleSaveEdit = () => {
    onUpdateProblem(current.id, editNotes, editSolution, editLanguage)
    setIsEditing(false)
  }

  if (done) {
    return (
      <div className="flashcard-overlay">
        <div className="flashcard-done">
          <div className="flashcard-done-emoji">🎉</div>
          <h2>Queue Complete!</h2>
          <p>You reviewed all {problems.length} problems.</p>
          <button className="btn-save" onClick={onExit}>Back to Dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flashcard-overlay">
      <div className="flashcard-container">

        <div className="flashcard-header">
          <span className="flashcard-progress">
            Problem {currentIndex + 1} / {problems.length}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!isEditing && (
              <button className="fc-edit-btn" onClick={handleStartEdit}>
                ✏️ Edit Notes
              </button>
            )}
            <button className="flashcard-exit" onClick={onExit}>✕ Exit Review</button>
          </div>
        </div>

        <div className="flashcard-progress-bar">
          <div
            className="flashcard-progress-fill"
            style={{ width: `${(currentIndex / problems.length) * 100}%` }}
          />
        </div>

        <div className="flashcard-body">
          <div className="flashcard-meta">
            <span className={`fc-difficulty difficulty-${current.difficulty}`}>
              {current.difficulty}
            </span>
            <span className="fc-category">{current.category}</span>
            <div className="fc-stars">
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={s <= current.confidence ? 'star-active' : 'star-inactive'}>⭐</span>
              ))}
            </div>
          </div>

          <h1 className="flashcard-title">
            {current.problem_number && (
              <span className="fc-number">#{current.problem_number} </span>
            )}
            {current.title}
          </h1>

          {current.leetcode_url && (
            <a
              href={current.leetcode_url}
              target="_blank"
              rel="noopener noreferrer"
              className="fc-url"
            >
              Open on LeetCode →
            </a>
          )}

          {/* ── Notes ── */}
          <div className="fc-section">
            <button
              className="fc-reveal-btn"
              onClick={() => setShowNotes(!showNotes)}
            >
              {showNotes ? '▼ Hide Notes' : '▶ Show My Notes'}
            </button>
            {showNotes && (
              <div className="fc-content">
                {isEditing ? (
                  <textarea
                    className="mm-textarea"
                    placeholder="Your approach, what confused you, key insights..."
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                  />
                ) : (
                  current.notes
                    ? <p>{current.notes}</p>
                    : <p className="fc-empty">No notes added.</p>
                )}
              </div>
            )}
          </div>

          {/* ── Solution ── */}
          <div className="fc-section">
            <button
              className="fc-reveal-btn"
              onClick={() => setShowSolution(!showSolution)}
            >
              {showSolution ? '▼ Hide Solution' : '▶ Show My Solution'}
            </button>
            {showSolution && (
              <div className="fc-content">
                {isEditing ? (
                  <>
                    <select
                      value={editLanguage}
                      onChange={e => setEditLanguage(e.target.value)}
                      className="mm-select"
                      style={{ marginBottom: '0.5rem' }}
                    >
                      {LANGUAGES.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                    <textarea
                      className="mm-textarea mm-code"
                      placeholder="Your solution code..."
                      value={editSolution}
                      onChange={e => setEditSolution(e.target.value)}
                    />
                  </>
                ) : (
                  current.solution ? (
                    <>
                      <div className="fc-solution-lang">{current.solution_language}</div>
                      <pre className="fc-code">{current.solution}</pre>
                    </>
                  ) : (
                    <p className="fc-empty">No solution added.</p>
                  )
                )}
              </div>
            )}
          </div>

          {/* ── Save Edit Button ── */}
          {isEditing && (
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          )}

          {(current.time_complexity || current.space_complexity) && (
            <div className="fc-complexity">
              {current.time_complexity && <span>⏱ {current.time_complexity}</span>}
              {current.space_complexity && <span>💾 {current.space_complexity}</span>}
            </div>
          )}
        </div>

        {!showResult ? (
          <div className="flashcard-footer">
            <p className="fc-prompt">How did it go?</p>
            <div className="fc-result-btns">
              <button className="fc-result-btn fc-failed" onClick={() => handleResult('failed')}>
                <span>🔴 Failed</span>
                <span>+{settings.failed_interval}d</span>
              </button>
              <button className="fc-result-btn fc-revisiting" onClick={() => handleResult('revisiting')}>
                <span>🟡 Got it</span>
                <span>+{settings.revisiting_interval}d</span>
              </button>
              <button className="fc-result-btn fc-mastered" onClick={() => handleResult('mastered')}>
                <span>🟢 Easy</span>
                <span>+{settings.mastered_interval}d</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flashcard-footer">
            <p className="fc-prompt">Next review date:</p>
            <div className="fc-confirm-row">
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="mm-input"
              />
              <button className="btn-save" onClick={handleConfirm}>
                Confirm & Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FlashcardReview