import { useState } from 'react'
import type { Task } from './types'

interface Props {
  onClose: () => void
  onSave: (title: string, priority: Task['priority'], due: string, status: Task['status'], description: string, tags: string[]) => void
  editTask?: Task | null
}

function TaskModal({ onClose, onSave, editTask }: Props) {
  const [title, setTitle] = useState(editTask?.title || '')
  const [priority, setPriority] = useState<Task['priority']>(editTask?.priority || 'medium')
  const [due, setDue] = useState(editTask?.due_date || '')
  const [status, setStatus] = useState<Task['status']>(editTask?.status || 'todo')
  const [description, setDescription] = useState(editTask?.description || '')
  const [tagInput, setTagInput] = useState(editTask?.tags?.join(', ') || '')

  const handleSave = () => {
    if (!title.trim()) return
    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '')
    onSave(title, priority, due, status, description, tags)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{editTask ? 'Edit Task' : 'New Task'}</h2>
        <input
          placeholder="Task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <input
          placeholder="Tags (comma separated: frontend, bug, design)"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
        />
        <select value={priority} onChange={e => setPriority(e.target.value as Task['priority'])}>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value as Task['status'])}>
          <option value="todo">Todo</option>
          <option value="in progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <input
          type="date"
          value={due}
          onChange={e => setDue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>
            {editTask ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskModal