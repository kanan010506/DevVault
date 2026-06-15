import { useState } from 'react'
import type { Bug } from './types'
import { CODE_LANGUAGES } from './types'
import { detectLanguage } from './utils'

interface Props {
  onClose: () => void
  onSave: (bug: Partial<Bug>) => void
  editBug?: Bug | null
}

function BugModal({ onClose, onSave, editBug }: Props) {
  const [title, setTitle] = useState(editBug?.title || '')
  const [errorMessage, setErrorMessage] = useState(editBug?.error_message || '')
  const [language, setLanguage] = useState(editBug?.language || '')
  const [cause, setCause] = useState(editBug?.cause || '')
  const [solution, setSolution] = useState(editBug?.solution || '')
  const [codeSnippet, setCodeSnippet] = useState(editBug?.code_snippet || '')
  const [codeLanguage, setCodeLanguage] = useState(editBug?.code_language || 'JavaScript')
  const [tagInput, setTagInput] = useState(editBug?.tags?.join(', ') || '')
  const [activeTab, setActiveTab] = useState<'details' | 'fix' | 'code'>('details')
  const [autoDetected, setAutoDetected] = useState(false)

  const handleErrorChange = (value: string) => {
    setErrorMessage(value)
    console.log('Current language:', language, 'autoDetected:', autoDetected)
    if (!language || autoDetected) {
      const detected = detectLanguage(value)
      console.log('Detected:', detected)
      if (detected) {
        setLanguage(detected)
        setAutoDetected(true)
      }
    }
  }

  const handleSave = () => {
    if (!title.trim()) return
    const tags = tagInput.split(',').map(t => t.trim()).filter(t => t !== '')
    onSave({
      title,
      error_message: errorMessage || null,
      language: language || null,
      cause: cause || null,
      solution: solution || null,
      code_snippet: codeSnippet || null,
      code_language: codeLanguage,
      tags,
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-header">
          <h2>{editBug ? 'Edit Bug' : 'Log Bug'}</h2>
          <button className="mm-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="mm-tabs">
          {(['details', 'fix', 'code'] as const).map(tab => (
            <button
              key={tab}
              className={`mm-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'details' ? '📋 Details' : tab === 'fix' ? '🔍 Cause & Fix' : '💻 Code'}
            </button>
          ))}
        </div>

        {activeTab === 'details' && (
          <div className="mm-tab-content">
            <input
              placeholder="Title (e.g. TypeError: Cannot read 'map' of undefined)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="mm-input"
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <textarea
              placeholder="Error message (paste the exact error from console)"
              value={errorMessage}
              onChange={e => handleErrorChange(e.target.value)}
              className="mm-textarea"
              style={{ minHeight: '100px' }}
            />
            <div className="mm-row">
              <input
                placeholder="Language/Framework (e.g. React, Python, Node)"
                value={language}
                onChange={e => { setLanguage(e.target.value); setAutoDetected(false) }}
                className="mm-input"
              />
              {autoDetected && language && (
                <span className="bug-auto-detected">✨ Auto-detected</span>
              )}
            </div>
            <input
              placeholder="Tags (comma separated: hooks, async, cors)"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              className="mm-input"
            />
          </div>
        )}

        {activeTab === 'fix' && (
          <div className="mm-tab-content">
            <label className="mm-settings-label">Cause</label>
            <textarea
              placeholder="Why did this happen?"
              value={cause}
              onChange={e => setCause(e.target.value)}
              className="mm-textarea"
            />
            <label className="mm-settings-label">Solution</label>
            <textarea
              placeholder="How did you fix it?"
              value={solution}
              onChange={e => setSolution(e.target.value)}
              className="mm-textarea"
            />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="mm-tab-content">
            <select
              value={codeLanguage}
              onChange={e => setCodeLanguage(e.target.value)}
              className="mm-select"
            >
              {CODE_LANGUAGES.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <textarea
              placeholder="Code snippet of the fix..."
              value={codeSnippet}
              onChange={e => setCodeSnippet(e.target.value)}
              className="mm-textarea mm-code"
            />
          </div>
        )}

        <div className="mm-modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>
            {editBug ? 'Save Changes' : 'Log Bug'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BugModal