import type { Problem } from './types'

interface Props {
  problem: Problem
  onEdit: (problem: Problem) => void
  onDelete: (id: string) => void
  onReview: (problem: Problem) => void
  onTogglePin: (problem: Problem) => void
  onReset: (problem: Problem) => void
  selectMode?: boolean
  isSelected?: boolean
  onToggleSelect?: (id: string) => void
}

function getStatusColor(status: string) {
  if (status === 'failed') return 'status-failed'
  if (status === 'revisiting') return 'status-revisiting'
  return 'status-mastered'
}

function getDaysOverdue(nextReviewDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(nextReviewDate)
  due.setHours(0, 0, 0, 0)
  return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
}

function getLastReviewed(lastReviewedAt: string | null): string {
  if (!lastReviewedAt) return 'Never reviewed'
  const today = new Date()
  const last = new Date(lastReviewedAt)
  const days = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Reviewed today'
  if (days === 1) return 'Reviewed yesterday'
  return `Reviewed ${days} days ago`
}

function ProblemCard({ problem, onEdit, onDelete, onReview, onTogglePin, onReset , selectMode, isSelected, onToggleSelect}: Props) {
  const daysOverdue = getDaysOverdue(problem.next_review_date)
  const isDue = daysOverdue >= 0

  return (
    <div className={`problem-card ${getStatusColor(problem.status)} ${problem.pinned ? 'problem-pinned' : ''}`}>
      <div className="problem-card-header">
        <div className="problem-card-title">
          {selectMode && (
            <input
              type="checkbox"
              className="mm-bulk-checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect?.(problem.id)}
            />
          )}
          {problem.problem_number && (
            <span className="problem-number">#{problem.problem_number}</span>
          )}
          <span className="problem-title">{problem.title}</span>
        </div>
        <div className="problem-header-right">
          <button
            className={`mm-pin-btn ${problem.pinned ? 'pinned' : ''}`}
            onClick={() => onTogglePin(problem)}
            title={problem.pinned ? 'Unpin' : 'Pin'}
          >
            📌
          </button>
          <span className={`problem-status-badge ${getStatusColor(problem.status)}`}>
            {problem.status === 'failed' ? '🔴' : problem.status === 'revisiting' ? '🟡' : '🟢'}
            {problem.status}
          </span>
        </div>
      </div>

      <div className="problem-card-meta">
        <span className={`problem-difficulty difficulty-${problem.difficulty}`}>
          {problem.difficulty}
        </span>
        <span className="problem-category">{problem.category}</span>
        <div className="problem-stars">
          {[1, 2, 3, 4, 5].map(star => (
            <span key={star} className={star <= problem.confidence ? 'star-active' : 'star-inactive'}>⭐</span>
          ))}
        </div>
      </div>

      {problem.tags && problem.tags.length > 0 && (
        <div className="problem-tags">
          {problem.tags.map(tag => (
            <span key={tag} className="problem-tag">#{tag}</span>
          ))}
        </div>
      )}

      <div className="problem-card-footer">
        <div className="problem-dates">
          <span className="problem-last-reviewed">{getLastReviewed(problem.last_reviewed_at)}</span>
          {isDue ? (
            <span className="problem-overdue">
              {daysOverdue === 0 ? 'Due today' : `Overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}`}
            </span>
          ) : (
            <span className="problem-next-review">
              Next review in {Math.abs(daysOverdue)} day{Math.abs(daysOverdue) > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="problem-card-actions">
          <button className="mm-review-btn" onClick={() => onReview(problem)}>
            Review Now
          </button>
          <button className="mm-reset-btn" onClick={() => onReset(problem)} title="Reset to failed">🔄</button>
          <button className="mm-edit-btn" onClick={() => onEdit(problem)}>✏️</button>
          <button className="mm-delete-btn" onClick={() => onDelete(problem.id)}>🗑️</button>
        </div>
      </div>
    </div>
  )
}

export default ProblemCard