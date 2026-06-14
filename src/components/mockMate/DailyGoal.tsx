import type { DailyGoal as DailyGoalType } from './types'

interface TodayCount {
  easy: number
  medium: number
  hard: number
}

interface Props {
  goal: DailyGoalType | null
  todayCount: TodayCount
  onEditGoal: () => void
}

function ProgressBar({ current, target }: { current: number, target: number }) {
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0
  return (
    <div className="goal-bar-wrap">
      <div className="goal-bar">
        <div className="goal-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="goal-bar-count">{current}/{target}</span>
    </div>
  )
}

function DailyGoal({ goal, todayCount, onEditGoal }: Props) {
  if (!goal || (goal.easy_target === 0 && goal.medium_target === 0 && goal.hard_target === 0)) {
    return (
      <div className="daily-goal-card">
        <div className="daily-goal-header">
          <h3>Today's Mission</h3>
          <button className="mm-edit-goal-btn" onClick={onEditGoal}>Set Goal</button>
        </div>
        <p className="goal-empty">No daily goal set. Set one to track your streak!</p>
      </div>
    )
  }

  return (
    <div className="daily-goal-card">
      <div className="daily-goal-header">
        <h3>Today's Mission</h3>
        <button className="mm-edit-goal-btn" onClick={onEditGoal}>Edit</button>
      </div>
      <div className="goal-rows">
        {goal.easy_target > 0 && (
          <div className="goal-row">
            <span className="goal-label difficulty-easy">Easy</span>
            <ProgressBar current={todayCount.easy} target={goal.easy_target} />
            <div className="goal-checks">
              {Array.from({ length: goal.easy_target }).map((_, i) => (
                <span key={i} className={i < todayCount.easy ? 'check-done' : 'check-empty'}>
                  {i < todayCount.easy ? '✅' : '⬜'}
                </span>
              ))}
            </div>
          </div>
        )}
        {goal.medium_target > 0 && (
          <div className="goal-row">
            <span className="goal-label difficulty-medium">Medium</span>
            <ProgressBar current={todayCount.medium} target={goal.medium_target} />
            <div className="goal-checks">
              {Array.from({ length: goal.medium_target }).map((_, i) => (
                <span key={i} className={i < todayCount.medium ? 'check-done' : 'check-empty'}>
                  {i < todayCount.medium ? '✅' : '⬜'}
                </span>
              ))}
            </div>
          </div>
        )}
        {goal.hard_target > 0 && (
          <div className="goal-row">
            <span className="goal-label difficulty-hard">Hard</span>
            <ProgressBar current={todayCount.hard} target={goal.hard_target} />
            <div className="goal-checks">
              {Array.from({ length: goal.hard_target }).map((_, i) => (
                <span key={i} className={i < todayCount.hard ? 'check-done' : 'check-empty'}>
                  {i < todayCount.hard ? '✅' : '⬜'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DailyGoal