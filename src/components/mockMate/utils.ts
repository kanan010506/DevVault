import type {Problem, DailyGoal as DailyGoalType} from './types.ts'

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isSameLocalDay(isoString: string, dateStr: string): boolean {
  return getLocalDateString(new Date(isoString)) === dateStr
}

export function getStreak(problems: Problem[], goal: DailyGoalType): number {
  if (problems.length === 0) return 0
  const hasGoal = goal.easy_target > 0 || goal.medium_target > 0 || goal.hard_target > 0

  let streak = 0
  const checkDate = new Date()

  while (true) {
    const dateStr = getLocalDateString(checkDate)
    const dayProblems = problems.filter(p => isSameLocalDay(p.created_at, dateStr))

    if (hasGoal) {
      const easyCount = dayProblems.filter(p => p.difficulty === 'easy').length
      const mediumCount = dayProblems.filter(p => p.difficulty === 'medium').length
      const hardCount = dayProblems.filter(p => p.difficulty === 'hard').length

      const goalMet =
        easyCount >= goal.easy_target &&
        mediumCount >= goal.medium_target &&
        hardCount >= goal.hard_target

      if (!goalMet) break
    } else {
      if (dayProblems.length === 0) break
    }

    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  }
  return streak
}

export function getTodayCount(problems: Problem[]) {
  const today = getLocalDateString()
  const todayProblems = problems.filter(p => isSameLocalDay(p.created_at, today))
  return {
    easy: todayProblems.filter(p => p.difficulty === 'easy').length,
    medium: todayProblems.filter(p => p.difficulty === 'medium').length,
    hard: todayProblems.filter(p => p.difficulty === 'hard').length,
  }
}

export function getDueProblems(problems: Problem[]): Problem[] {
  const today = getLocalDateString()
  return problems
    .filter(p => p.next_review_date <= today)
    .sort((a, b) => {
      const aDays = new Date(today).getTime() - new Date(a.next_review_date).getTime()
      const bDays = new Date(today).getTime() - new Date(b.next_review_date).getTime()
      return bDays - aDays
    })
}

export function getStatusColor(status: string) {
  if (status === 'failed') return 'status-failed'
  if (status === 'revisiting') return 'status-revisiting'
  return 'status-mastered'
}

export function getDaysOverdue(nextReviewDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(nextReviewDate)
  due.setHours(0, 0, 0, 0)
  return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
}

export function getLastReviewed(lastReviewedAt: string | null): string {
  if (!lastReviewedAt) return 'Never reviewed'
  const today = new Date()
  const last = new Date(lastReviewedAt)
  const days = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Reviewed today'
  if (days === 1) return 'Reviewed yesterday'
  return `Reviewed ${days} days ago`
}

export function addDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}
