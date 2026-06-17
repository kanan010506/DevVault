import { useNavigate } from 'react-router-dom'
import type { Note } from './types'
import { getPreview, getUpdatedText } from './utils'

interface Props {
  note: Note
  onDelete: (id: string) => void
  onTogglePin: (note: Note) => void
}

function NoteCard({ note, onDelete, onTogglePin }: Props) {
  const navigate = useNavigate()

  return (
    <div
      className={`note-card ${note.pinned ? 'note-pinned' : ''}`}
      onClick={() => navigate(`/technotes/${note.id}`)}
    >
      <div className="note-card-header">
        <div className="note-card-title">
          <span className="note-title">
            <span className="note-type-badge">{note.note_type === 'code' ? '💻' : '📝'}</span> {note.title}
          </span>
          <span className="note-category">{note.category}</span>
        </div>
        <div className="note-card-actions">
          <button
            className={`mm-pin-btn ${note.pinned ? 'pinned' : ''}`}
            onClick={(e) => { e.stopPropagation(); onTogglePin(note) }}
            title={note.pinned ? 'Unpin' : 'Pin'}
          >
            📌
          </button>
          <button
            className="mm-delete-btn"
            onClick={(e) => { e.stopPropagation(); onDelete(note.id) }}
          >🗑️</button>
        </div>
      </div>

      {note.content && (
        <p className="note-preview">{getPreview(note.content)}</p>
      )}

      {note.tags && note.tags.length > 0 && (
        <div className="problem-tags">
          {note.tags.map(tag => (
            <span key={tag} className="problem-tag">#{tag}</span>
          ))}
        </div>
      )}

      <div className="note-card-footer">
        <span className="note-updated">{getUpdatedText(note.updated_at)}</span>
        {note.view_count > 0 && (
          <span className="note-views">👁 {note.view_count}</span>
        )}
      </div>
    </div>
  )
}

export default NoteCard