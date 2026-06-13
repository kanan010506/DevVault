import { useState } from 'react'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import TaskCard from './TaskCard'
import type { Task, Project } from './types'
import { COLUMNS } from './types'

type SortOption = 'due_date' | 'priority'

interface Props {
  selectedProject: Project
  tasks: Task[]
  onDragEnd: (result: DropResult) => void
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onCompleteTask: (task: Task) => void
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

function sortTasks(tasks: Task[], sort: SortOption): Task[] {
  if (sort === 'priority') {
    return [...tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
  }
  if (sort === 'due_date') {
    return [...tasks].sort((a, b) => {
      if (!a.due_date && !b.due_date) return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      const dateDiff = new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      if (dateDiff !== 0) return dateDiff
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    })
  }
  return tasks
}

function KanbanBoard({ selectedProject, tasks, onDragEnd, onAddTask, onEditTask, onDeleteTask, onCompleteTask }: Props) {
  const [sort, setSort] = useState<SortOption>('due_date')
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [activePriority, setActivePriority] = useState<string | null>(null)

  const allTags = [...new Set(tasks.flatMap(t => t.tags || []))]

  const overdueTasks = tasks.filter(t => {
    if (!t.due_date || t.status === 'done') return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(t.due_date)
    due.setHours(0, 0, 0, 0)
    return due < today
  })

  const getTasksByStatus = (status: string) => {
    const filtered = tasks.filter(t => {
      const matchesStatus = t.status === status
      const matchesSearch = search.trim() === '' ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      const matchesTag = !activeTag || t.tags?.includes(activeTag)
      const matchesPriority = !activePriority || t.priority === activePriority
      return matchesStatus && matchesSearch && matchesTag && matchesPriority
    })
    return sortTasks(filtered, sort)
  }

  const handleTagClick = (tag: string) => {
    setActiveTag(prev => prev === tag ? null : tag)
  }

  return (
    <div className="kanban-area">
      <div className="kanban-header">
        <h2 className="kanban-title">{selectedProject.name}</h2>
        <div className="kanban-header-actions">
          <input
            className="task-search"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="sort-select"
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
          >
            <option value="due_date">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
          </select>
          <button className="add-task-btn" onClick={onAddTask}>
            + Add Task
          </button>
        </div>
      </div>

      {/* Project stats */}
      <div className="project-stats">
        <div className="stat-item">
          <span className="stat-value">{tasks.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">{tasks.filter(t => t.status === 'done').length}</span>
          <span className="stat-label">Done</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value stat-overdue">{overdueTasks.length}</span>
          <span className="stat-label">Overdue</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value stat-percent">
            {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%
          </span>
          <span className="stat-label">Complete</span>
        </div>
      </div>

      {overdueTasks.length > 0 && (
        <div className="overdue-banner">
          ⚠️ {overdueTasks.length} task{overdueTasks.length > 1 ? 's are' : ' is'} overdue in this project
        </div>
      )}

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="tag-filters">
          <span className="tag-filter-label">Filter:</span>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-filter-btn ${activeTag === tag ? 'active' : ''}`}
              onClick={() => handleTagClick(tag)}
            >
              #{tag}
            </button>
          ))}
          {activeTag && (
            <button className="tag-filter-clear" onClick={() => setActiveTag(null)}>
              ✕ Clear
            </button>
          )}
        </div>
      )}

      {/* Priority filters */}
      <div className="tag-filters">
        <span className="tag-filter-label">Priority:</span>
        {(['high', 'medium', 'low'] as const).map(p => (
          <button
            key={p}
            className={`priority-filter-btn priority-filter-${p} ${activePriority === p ? 'active' : ''}`}
            onClick={() => setActivePriority(prev => prev === p ? null : p)}
          >
            {p}
          </button>
        ))}
        {activePriority && (
          <button className="tag-filter-clear" onClick={() => setActivePriority(null)}>
            ✕ Clear
          </button>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-columns">
          {COLUMNS.map(col => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  className="kanban-column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div className="column-header">
                    <span className="column-title">{col}</span>
                    <span className="column-count">{getTasksByStatus(col).length}</span>
                  </div>
                  {getTasksByStatus(col).length === 0 ? (
                    <div className="column-empty">
                      {col === 'todo' && '📋 No tasks yet'}
                      {col === 'in progress' && '⚡ Nothing in progress'}
                      {col === 'done' && '✅ Nothing done yet'}
                    </div>
                  ) : (
                    getTasksByStatus(col).map((task, index) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onComplete={onCompleteTask}
                        onTagClick={handleTagClick}
                        activeTag={activeTag}
                      />
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}

export default KanbanBoard