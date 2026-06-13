import { useState } from 'react'
import type { Project } from './types'

interface Props {
  onClose: () => void
  onSave: (name: string, desc: string, status: Project['status']) => void
  editProject?: Project | null
}

function ProjectModal({ onClose, onSave, editProject }: Props) {
  const [name, setName] = useState(editProject?.name || '')
  const [desc, setDesc] = useState(editProject?.description || '')
  const [status, setStatus] = useState<Project['status']>(editProject?.status || 'active')

  const handleSave = () => {
    if (!name.trim()) return
    onSave(name, desc, status)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{editProject ? 'Edit Project' : 'New Project'}</h2>
        <input
          placeholder="Project name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
        <textarea
          placeholder="Description (optional)"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
        <select value={status} onChange={e => setStatus(e.target.value as Project['status'])}>
          <option value="active">Active</option>
          <option value="on hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>
            {editProject ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectModal