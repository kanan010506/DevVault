import { useState } from 'react'
import type { Problem, Difficulty, Status } from './types'
import { CATEGORIES, LANGUAGES } from './types'

interface Props {
  onClose: () => void
  onSave: (problem: Partial<Problem>) => void
  editProblem?: Problem | null
  preferredLanguage?: string
}

function ProblemModal({ onClose, onSave, editProblem, preferredLanguage = 'Python3' }: Props) {
  const [url, setUrl] = useState(editProblem?.leetcode_url || '')
  const [problemNumber, setProblemNumber] = useState<number | ''>(editProblem?.problem_number || '')
  const [title, setTitle] = useState(editProblem?.title || '')
  const [difficulty, setDifficulty] = useState<Difficulty>(editProblem?.difficulty || 'easy')
  const [category, setCategory] = useState(editProblem?.category || CATEGORIES[0])
  const [notes, setNotes] = useState(editProblem?.notes || '')
  const [solution, setSolution] = useState(editProblem?.solution || '')
  const [solutionLanguage, setSolutionLanguage] = useState(editProblem?.solution_language || preferredLanguage)
  const [timeComplexity, setTimeComplexity] = useState(editProblem?.time_complexity || '')
  const [spaceComplexity, setSpaceComplexity] = useState(editProblem?.space_complexity || '')
  const [status, setStatus] = useState<Status>(editProblem?.status || 'failed')
  const [confidence, setConfidence] = useState(editProblem?.confidence || 3)
  const [tagInput, setTagInput] = useState(editProblem?.tags?.join(', ') || '')
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'solution'>('details')

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl)
    const match = newUrl.match(/leetcode\.com\/problems\/([^/]+)/)
    if (match) {
      const slug = match[1]
      const formatted = slug
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      setTitle(prev => prev || formatted)
    }
  }

  const handleSave = () => {
    if (!title.trim()) return
    const tags = tagInput.split(',').map(t => t.trim()).filter(t => t !== '')
    onSave({
      problem_number: problemNumber === '' ? null : Number(problemNumber),
      title,
      leetcode_url: url || null,
      difficulty,
      category,
      notes: notes || null,
      solution: solution || null,
      solution_language: solutionLanguage,
      time_complexity: timeComplexity || null,
      space_complexity: spaceComplexity || null,
      status,
      confidence,
      tags,
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-header">
          <h2>{editProblem ? 'Edit Problem' : 'Log Problem'}</h2>
          <button className="mm-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* ── Tabs ── */}
        <div className="mm-tabs">
          {(['details', 'notes', 'solution'] as const).map(tab => (
            <button
              key={tab}
              className={`mm-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'details' ? '📋 Details' : tab === 'notes' ? '📝 Notes' : '💡 Solution'}
            </button>
          ))}
        </div>

        {/* ── Details Tab ── */}
        {activeTab === 'details' && (
          <div className="mm-tab-content">
            <input
              placeholder="LeetCode URL (paste to auto-fill title)"
              value={url}
              onChange={e => handleUrlChange(e.target.value)}
              className="mm-input"
            />
            <div className="mm-row">
              <input
                placeholder="#Number"
                type="number"
                value={problemNumber}
                onChange={e => setProblemNumber(e.target.value === '' ? '' : Number(e.target.value))}
                className="mm-input mm-input-small"
              />
              <input
                placeholder="Problem title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="mm-input mm-input-grow"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
            </div>
            <div className="mm-row">
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as Difficulty)}
                className="mm-select"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="mm-select"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="mm-row">
              <input
                placeholder="Time complexity (e.g. O(n))"
                value={timeComplexity}
                onChange={e => setTimeComplexity(e.target.value)}
                className="mm-input"
              />
              <input
                placeholder="Space complexity (e.g. O(1))"
                value={spaceComplexity}
                onChange={e => setSpaceComplexity(e.target.value)}
                className="mm-input"
              />
            </div>
            <input
              placeholder="Tags (comma separated: hashmap, greedy)"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              className="mm-input"
            />
            <div className="mm-row">
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Status)}
                className="mm-select"
              >
                <option value="failed">Failed</option>
                <option value="revisiting">Revisiting</option>
                <option value="mastered">Mastered</option>
              </select>
              <div className="mm-confidence">
                <span className="mm-confidence-label">Confidence:</span>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className={`mm-star ${star <= confidence ? 'active' : ''}`}
                    onClick={() => setConfidence(star)}
                  >⭐</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Notes Tab ── */}
        {activeTab === 'notes' && (
          <div className="mm-tab-content">
            <textarea
              placeholder="Your approach, what confused you, key insights..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="mm-textarea"
            />
          </div>
        )}

        {/* ── Solution Tab ── */}
        {activeTab === 'solution' && (
          <div className="mm-tab-content">
            <select
              value={solutionLanguage}
              onChange={e => setSolutionLanguage(e.target.value)}
              className="mm-select"
            >
              {LANGUAGES.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <textarea
              placeholder="Your solution code..."
              value={solution}
              onChange={e => setSolution(e.target.value)}
              className="mm-textarea mm-code"
            />
          </div>
        )}

        <div className="mm-modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>
            {editProblem ? 'Save Changes' : 'Log Problem'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProblemModal