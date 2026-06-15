export const CODE_LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java',
  'C', 'C++', 'C#', 'Go', 'Rust',
  'Ruby', 'PHP', 'Swift', 'Kotlin',
  'HTML', 'CSS', 'SQL', 'Bash', 'JSON',
] as const

export interface Bug {
  id: string
  user_id: string
  title: string
  error_message: string | null
  language: string | null
  cause: string | null
  solution: string | null
  code_snippet: string | null
  code_language: string
  tags: string[]
  hit_count: number
  last_seen_at: string
  created_at: string
}