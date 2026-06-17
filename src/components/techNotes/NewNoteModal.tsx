import { useState } from 'react'
import { DEFAULT_CATEGORIES } from './types'

interface Props {
  existingCategories: string[]
  onClose: () => void
  onCreate: (title: string, category: string, noteType: 'text' | 'code') => void
}

function NewNoteModal({ existingCategories, onClose, onCreate }: Props) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Uncategorized')
  const [newCategory, setNewCategory] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [noteType, setNoteType] = useState<'text' | 'code'>('text')

  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...existingCategories])]

  const handleCreate = () => {
    if (!title.trim()) return
    const finalCategory = showNewCategory && newCategory.trim() ? newCategory.trim() : category
    onCreate(title, finalCategory, noteType)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>New Note</h2>

        <div className="tn-type-toggle">
          <button
            className={`tn-type-btn ${noteType === 'text' ? 'active' : ''}`}
            onClick={() => setNoteType('text')}
          >
            📝 Text Note
          </button>
          <button
            className={`tn-type-btn ${noteType === 'code' ? 'active' : ''}`}
            onClick={() => setNoteType('code')}
          >
            💻 Code Note
          </button>
        </div>

        <input
          placeholder="Note title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />

        {!showNewCategory ? (
          <div className="mm-row">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="mm-select"
            >
              {allCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              className="mm-sort-dir-btn"
              onClick={() => setShowNewCategory(true)}
            >
              + New
            </button>
          </div>
        ) : (
          <div className="mm-row">
            <input
              placeholder="New category name"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="mm-input"
            />
            <button
              className="mm-sort-dir-btn"
              onClick={() => setShowNewCategory(false)}
            >
              Cancel
            </button>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleCreate}>Create Note</button>
        </div>
      </div>
    </div>
  )
}

export default NewNoteModal