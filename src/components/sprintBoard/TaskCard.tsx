import { Draggable } from '@hello-pangea/dnd'
import type { Task } from './types'

interface Props {
  task: Task
  index: number
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onComplete: (task: Task) => void
  onTagClick: (tag: string) => void
  activeTag: string | null
}

function getDateHighlight(task: Task): string {
  if (!task.due_date) return ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(task.due_date)
  due.setHours(0, 0, 0, 0)
  if (task.status === 'done') return 'task-completed'
  if (due < today) return 'task-overdue'
  if (due.getTime() === today.getTime()) return 'task-due-today'
  return 'task-on-track'
}

function TaskCard({ task, index, onEdit, onDelete, onComplete, onTagClick, activeTag }: Props) {
  const highlight = getDateHighlight(task)

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          className={`task-card ${highlight}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="task-card-header">
            <input
              type="checkbox"
              className="task-checkbox"
              checked={task.status === 'done'}
              onChange={() => onComplete(task)}
              onClick={e => e.stopPropagation()}
            />
            <div className={`task-title ${task.status === 'done' ? 'task-title-done' : ''}`}>
              {task.title}
            </div>
            <div className="task-actions">
              <button
                className="task-edit-btn"
                onClick={e => { e.stopPropagation(); onEdit(task) }}
              >✏️</button>
              <button
                className="task-delete-btn"
                onClick={e => { e.stopPropagation(); onDelete(task.id) }}
              >🗑️</button>
            </div>
          </div>

          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="task-tags">
              {task.tags.map(tag => (
                <span
                  key={tag}
                  className={`task-tag ${activeTag === tag ? 'task-tag-active' : ''}`}
                  onClick={e => { e.stopPropagation(); onTagClick(tag) }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <span className={`task-priority priority-${task.priority}`}>
            {task.priority}
          </span>

          {task.due_date && (
            <div className="task-due">Due: {task.due_date}</div>
          )}
        </div>
      )}
    </Draggable>
  )
}

export default TaskCard