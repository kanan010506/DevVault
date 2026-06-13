export interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'on hold' | 'completed'
}

export interface Task {
  id: string
  title: string
  status: 'todo' | 'in progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  project_id: string
  description: string | null
  tags: string[]
}

export const COLUMNS = ['todo', 'in progress', 'done'] as const