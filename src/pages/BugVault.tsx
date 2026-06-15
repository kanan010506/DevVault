import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Layout, ConfirmModal } from '../components/common'
import { BugCard, BugModal } from '../components/bugVault'
import type { Bug } from '../components/bugVault/types'
import '../styles/bugvault.css'
import '../styles/mockmate.css'

function BugVault() {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingBug, setEditingBug] = useState<Bug | null>(null)
  const [search, setSearch] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)


  useEffect(() => {
    const fetchBugs = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('bugs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setBugs(data)
    }

    fetchBugs()
  }, [])

  const handleAddBug = async (bug: Partial<Bug>) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('bugs').insert({
      ...bug,
      user_id: user?.id,
    }).select().single()
    if (data) setBugs(prev => [data, ...prev])
    setShowModal(false)
  }

  const handleEditBug = async (bug: Partial<Bug>) => {
    if (!editingBug) return
    const { data } = await supabase.from('bugs').update(bug)
      .eq('id', editingBug.id).select().single()
    if (data) setBugs(prev => prev.map(b => b.id === editingBug.id ? data : b))
    setEditingBug(null)
  }

  const handleDeleteBug = async (id: string) => {
    await supabase.from('bugs').delete().eq('id', id)
    setBugs(prev => prev.filter(b => b.id !== id))
    setConfirmDelete(null)
  }

  const handleSawAgain = async (id: string) => {
    const bug = bugs.find(b => b.id === id)
    if (!bug) return
    const { data } = await supabase.from('bugs').update({
      hit_count: bug.hit_count + 1,
      last_seen_at: new Date().toISOString(),
    }).eq('id', id).select().single()
    if (data) setBugs(prev => prev.map(b => b.id === id ? data : b))
  }
  const languages = [...new Set(bugs.map(b => b.language).filter(Boolean))] as string[]

  const filteredBugs = bugs.filter(b => {
    const matchesSearch = search.trim() === '' ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.error_message?.toLowerCase().includes(search.toLowerCase()) ||
      b.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchesLanguage = filterLanguage === 'all' || b.language === filterLanguage
    return matchesSearch && matchesLanguage
  })

  return (
    <Layout>
      <div className="bugvault">
        <div className="bv-topbar">
          <span className="bv-title">🐛 BugVault ({bugs.length})</span>
          <button className="mm-log-btn" onClick={() => setShowModal(true)}>
            + Log Bug
          </button>
        </div>
        {bugs.filter(b => b.hit_count > 1).length > 0 && (
          <div className="bug-frequent-widget">
            <h3>🏆 Your Most Frequent Bugs</h3>
            <div className="bug-frequent-list">
              {bugs
                .filter(b => b.hit_count > 1)
                .sort((a, b) => b.hit_count - a.hit_count)
                .slice(0, 3)
                .map(bug => (
                  <div key={bug.id} className="bug-frequent-item">
                    <span className="bug-frequent-title">{bug.title}</span>
                    <span className="bug-frequent-count">🔁 {bug.hit_count}×</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="mm-library-header">
          <input
            className="mm-search"
            placeholder="Search by title, error, tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {languages.length > 0 && (
            <select
              className="mm-filter-select"
              value={filterLanguage}
              onChange={e => setFilterLanguage(e.target.value)}
            >
              <option value="all">All Languages</option>
              {languages.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          )}
        </div>

        <div className="problem-list">
          {filteredBugs.length === 0 ? (
            <p className="mm-empty">
              {bugs.length === 0 ? 'No bugs logged yet. Log your first bug!' : 'No bugs match your search.'}
            </p>
          ) : (
            filteredBugs.map(bug => (
              <BugCard
                key={bug.id}
                bug={bug}
                onEdit={setEditingBug}
                onDelete={(id) => setConfirmDelete(id)}
                onSawAgain={handleSawAgain}
              />
            ))
          )}
        </div>
      </div>

      {(showModal || editingBug) && (
        <BugModal
          onClose={() => { setShowModal(false); setEditingBug(null) }}
          onSave={editingBug ? handleEditBug : handleAddBug}
          editBug={editingBug}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          message="Are you sure you want to delete this bug?"
          onConfirm={() => handleDeleteBug(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </Layout>
  )
}

export default BugVault