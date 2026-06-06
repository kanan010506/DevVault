import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import '../../styles/sidebar.css'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { label: 'BugVault', path: '/bugvault', icon: '🐛' },
  { label: 'TechNotes', path: '/technotes', icon: '📝' },
  { label: 'MockMate', path: '/mockmate', icon: '💡' },
  { label: 'SprintBoard', path: '/sprintboard', icon: '🚀' },
]

function Sidebar() {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <aside className={`sidebar ${expanded ? 'expanded' : ''}`}>
      <button className="sidebar-toggle" onClick={() => setExpanded(!expanded)}>
        {expanded ? '✕' : '⋯'}
      </button>

      {expanded && <div className="sidebar-logo">DevVault</div>}

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
            title={item.label}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {expanded && <span className="sidebar-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout} title="Logout">
        <span>🚪</span>
        {expanded && <span className="sidebar-label">Logout</span>}
      </button>
    </aside>
  )
}

export default Sidebar