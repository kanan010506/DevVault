export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  category: string
  tags: string[]
  pinned: boolean
  view_count: number
  last_viewed_at: string | null
  note_type: 'text' | 'code'
  created_at: string
  updated_at: string
}

export const DEFAULT_CATEGORIES = [
  'Uncategorized',
  'React',
  'JavaScript',
  'TypeScript',
  'Git',
  'Docker',
  'Algorithms',
  'CSS',
  'Backend',
  'Database',
] as const