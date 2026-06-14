export type Difficulty = 'easy' | 'medium' | 'hard'
export type Status = 'failed' | 'revisiting' | 'mastered'

export const CATEGORIES = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Binary Search',
  'Recursion',
  'Backtracking',
  'Sliding Window',
  'Two Pointers',
  'Heap',
  'Stack',
  'Queue',
  'Hash Map',
  'Math',
  'Bit Manipulation',
] as const

export const LANGUAGES = [
  'C', 'C++', 'C#', 'Java',
  'Python', 'Python3',
  'JavaScript', 'TypeScript',
  'Go', 'Ruby', 'Swift',
  'Kotlin', 'Rust', 'Scala',
  'PHP', 'Racket', 'Erlang',
  'Elixir', 'Dart',
] as const

export interface Problem {
  id: string
  user_id: string
  problem_number: number | null
  title: string
  leetcode_url: string | null
  difficulty: Difficulty
  category: string
  notes: string | null
  solution: string | null
  solution_language: string
  time_complexity: string | null
  space_complexity: string | null
  status: Status
  confidence: number
  tags: string[]
  next_review_date: string
  last_reviewed_at: string | null
  created_at: string
}

export interface DailyGoal {
  id: string
  user_id: string
  easy_target: number
  medium_target: number
  hard_target: number
}

export interface MockMateSettings {
  id: string
  user_id: string
  failed_interval: number
  revisiting_interval: number
  mastered_interval: number
  preferred_language: string
}

export interface Problem {
  id: string
  user_id: string
  problem_number: number | null
  title: string
  leetcode_url: string | null
  difficulty: Difficulty
  category: string
  notes: string | null
  solution: string | null
  solution_language: string
  time_complexity: string | null
  space_complexity: string | null
  status: Status
  confidence: number
  tags: string[]
  next_review_date: string
  last_reviewed_at: string | null
  pinned: boolean
  created_at: string
}

export interface TodayCount {
  easy: number
  medium: number
  hard: number
}