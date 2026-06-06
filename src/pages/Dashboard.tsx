import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Layout } from '../components/common'
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
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUsername(user?.user_metadata?.user_name || 'Developer')
      setAvatar(user?.user_metadata?.avatar_url || '')
    })
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