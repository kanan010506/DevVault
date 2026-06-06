import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import type { User } from '@supabase/supabase-js'
import { Login, Dashboard } from './pages'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div style={{ background: '#0a0a1a', minHeight: '100vh' }} />

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
        <Route
          path='/login'
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path='/dashboard'
          element={user ? <div><Dashboard /></div> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App