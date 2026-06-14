import type {Task} from './types.ts'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }
type SortOption = 'due_date' | 'priority'

export function sortTasks(tasks: Task[], sort: SortOption): Task[] {
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

export function getDateHighlight(task: Task): string {
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