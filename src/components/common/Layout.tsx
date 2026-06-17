import { useCallback, useEffect, useMemo, useState } from 'react'
import { Sidebar, GlobalSearchModal } from './'
import { supabase } from '../../lib/supabaseClient'
import type { GlobalSearchResults } from './GlobalSearchModal'
import '../../styles/layout.css'

function Layout({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<GlobalSearchResults>({
    tasks: [],
    problems: [],
    bugs: [],
    notes: [],
  })

  const trimmed = useMemo(() => query.trim(), [query])

  const runSearch = useCallback(async (q: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setLoading(true)
    const pattern = `%${q}%`

    const [tasksRes, problemsRes, bugsRes, notesRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('id,title,project_id,due_date,status')
        .eq('user_id', user.id)
        .or(`title.ilike.${pattern},description.ilike.${pattern}`)
        .limit(5),
      supabase
        .from('problems')
        .select('id,title,problem_number,next_review_date,status')
        .eq('user_id', user.id)
        .or(`title.ilike.${pattern},notes.ilike.${pattern}`)
        .limit(5),
      supabase
        .from('bugs')
        .select('id,title,language')
        .eq('user_id', user.id)
        .or(`title.ilike.${pattern},error_message.ilike.${pattern},cause.ilike.${pattern},solution.ilike.${pattern}`)
        .limit(5),
      supabase
        .from('notes')
        .select('id,title,category')
        .eq('user_id', user.id)
        .or(`title.ilike.${pattern},content.ilike.${pattern}`)
        .limit(5),
    ])

    setResults({
      tasks: tasksRes.data || [],
      problems: problemsRes.data || [],
      bugs: bugsRes.data || [],
      notes: notesRes.data || [],
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isK = e.key === 'k' || e.key === 'K'
      const meta = e.metaKey || e.ctrlKey
      if (!meta || !isK) return
      e.preventDefault()
      setSearchOpen(true)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (!searchOpen) return
    if (trimmed.length === 0) {
      setResults({ tasks: [], problems: [], bugs: [], notes: [] })
      setLoading(false)
      return
    }

    const handle = setTimeout(() => {
      runSearch(trimmed)
    }, 250)

    return () => clearTimeout(handle)
  }, [searchOpen, trimmed, runSearch])

  return (
    <div className="layout">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} />
      <main className="layout-main">
        {children}
      </main>
      <GlobalSearchModal
        open={searchOpen}
        query={query}
        onQueryChange={setQuery}
        loading={loading}
        results={results}
        onClose={() => { setSearchOpen(false); setQuery(''); setResults({ tasks: [], problems: [], bugs: [], notes: [] }); setLoading(false) }}
      />
    </div>
  )
}

export default Layout
