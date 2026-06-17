import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Layout } from '../components/common'
import { getLocalDateString, getStreak, getDueProblems } from '../components/mockMate/utils'
import type { Problem, DailyGoal as DailyGoalType, MockMateSettings as SettingsType } from '../components/mockMate/types'
import '../styles/dashboard.css'

const tools = [
  {
    label: 'BugVault',
    icon: '🐛',
    description: 'Log and search bugs you have solved',
    path: '/bugvault',
    color: '#f87171',
  },
  {
    label: 'TechNotes',
    icon: '📝',
    description: 'Your personal markdown knowledge base',
    path: '/technotes',
    color: '#60a5fa',
  },
  {
    label: 'MockMate',
    icon: '💡',
    description: 'Track LeetCode problems with spaced repetition',
    path: '/mockmate',
    color: '#a78bfa',
  },
  {
    label: 'SprintBoard',
    icon: '🚀',
    description: 'Manage your side projects like a pro',
    path: '/sprintboard',
    color: '#34d399',
  },
]

function Dashboard() {
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState('')
  const [activeTaskCount, setActiveTaskCount] = useState(0)
  const [dueTodayTaskCount, setDueTodayTaskCount] = useState(0)
  const [bugCount, setBugCount] = useState(0)
  const [noteCount, setNoteCount] = useState(0)
  const [mockmateDueCount, setMockmateDueCount] = useState(0)
  const [mockmateStreak, setMockmateStreak] = useState(0)
  const [mockmateBestStreak, setMockmateBestStreak] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUsername(user?.user_metadata?.user_name || 'Developer')
      setAvatar(user?.user_metadata?.avatar_url || '')
    })
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = getLocalDateString()

      const [
        activeTasksRes,
        dueTodayRes,
        bugCountRes,
        noteCountRes,
        problemsRes,
        goalRes,
        settingsRes,
      ] = await Promise.all([
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('user_id', user.id).neq('status', 'done'),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('user_id', user.id).neq('status', 'done').eq('due_date', today),
        supabase.from('bugs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('notes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('problems').select('created_at,difficulty,next_review_date').eq('user_id', user.id),
        supabase.from('daily_goals').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('mockmate_settings').select('*').eq('user_id', user.id).maybeSingle(),
      ])

      setActiveTaskCount(activeTasksRes.count || 0)
      setDueTodayTaskCount(dueTodayRes.count || 0)
      setBugCount(bugCountRes.count || 0)
      setNoteCount(noteCountRes.count || 0)

      const problems = (problemsRes.data || []) as Array<Pick<Problem, 'created_at' | 'difficulty' | 'next_review_date'>>
      const goal = (goalRes.data || { easy_target: 0, medium_target: 0, hard_target: 0 }) as DailyGoalType
      const streak = getStreak(problems as unknown as Problem[], goal)
      setMockmateStreak(streak)
      setMockmateDueCount(getDueProblems(problems as unknown as Problem[]).length)

      const settings = settingsRes.data as SettingsType | null
      setMockmateBestStreak(settings?.best_streak || 0)
    }

    fetchStats()
  }, [])

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="dashboard-user">
            {avatar && <img src={avatar} alt="avatar" className="dashboard-avatar" />}
            <div>
              <h1 className="dashboard-title">Welcome back, <span>{username}</span> 👋</h1>
              <p className="dashboard-subtitle">What are you working on today?</p>
            </div>
          </div>
        </div>

        {dueTodayTaskCount > 0 && (
          <div className="dashboard-banner">
            <span>⏰ {dueTodayTaskCount} task{dueTodayTaskCount > 1 ? 's' : ''} due today in SprintBoard</span>
            <button className="dashboard-banner-btn" onClick={() => navigate('/sprintboard')}>
              Open SprintBoard →
            </button>
          </div>
        )}

        <div className="dashboard-grid">
          {tools.map(tool => (
            <div
              key={tool.label}
              className="tool-card"
              onClick={() => navigate(tool.path)}
              style={{ '--accent': tool.color } as React.CSSProperties}
            >
              <div className="tool-icon">{tool.icon}</div>
              <div className="tool-info">
                <h3 className="tool-name">{tool.label}</h3>
                <p className="tool-desc">{tool.description}</p>
                <p className="tool-stat">
                  {tool.label === 'SprintBoard'
                    ? `${activeTaskCount} active • ${dueTodayTaskCount} due today`
                    : tool.label === 'MockMate'
                      ? `${mockmateDueCount} due • streak ${mockmateStreak} (best ${mockmateBestStreak})`
                      : tool.label === 'BugVault'
                        ? `${bugCount} logged`
                        : `${noteCount} notes`}
                </p>
              </div>
              <div className="tool-arrow">→</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
