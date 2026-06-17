import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Layout, ConfirmModal } from '../components/common'
import { CategorySidebar, NoteCard, NewNoteModal } from '../components/techNotes'
import type { Note } from '../components/techNotes/types'
import '../styles/technotes.css'
import '../styles/mockmate.css'

function TechNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'text' | 'code'>('all')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      if (data) setNotes(data)
    }
    fetchNotes()
  }, [])

  const handleCreateNote = async (title: string, category: string, noteType: 'text' | 'code') => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('notes').insert({
      title,
      category,
      content: '',
      note_type: noteType,
      user_id: user?.id,
    }).select().single()
    if (data) {
      setShowNewModal(false)
      navigate(`/technotes/${data.id}`)
    }
  }

  const handleDeleteNote = async (id: string) => {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(prev => prev.filter(n => n.id !== id))
    setConfirmDelete(null)
  }

  const handleTogglePin = async (note: Note) => {
    const { data } = await supabase.from('notes').update({
      pinned: !note.pinned
    }).eq('id', note.id).select().single()
    if (data) setNotes(prev => prev.map(n => n.id === note.id ? data : n))
  }

  const filteredNotes = notes.filter(n => {
    const matchesCategory = activeCategory === 'all' || n.category === activeCategory
    const matchesType = filterType === 'all' || n.note_type === filterType
    const matchesSearch = search.trim() === '' ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    return matchesCategory && matchesType && matchesSearch
  })

  // pinned first
  filteredNotes.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  const recentlyViewed = [...notes]
    .filter(n => n.last_viewed_at)
    .sort((a, b) => new Date(b.last_viewed_at!).getTime() - new Date(a.last_viewed_at!).getTime())
    .slice(0, 5)

  const existingCategories = [...new Set(notes.map(n => n.category))]

  return (
    <Layout>
      <div className="technotes-page">
        <CategorySidebar
          notes={notes}
          activeCategory={activeCategory}
          onCategoryClick={setActiveCategory}
        />

        <div className="tn-main">
          <div className="tn-main-header">
            <span className="tn-main-title">📝 TechNotes ({notes.length})</span>
            <button className="mm-log-btn" onClick={() => setShowNewModal(true)}>
              + New Note
            </button>
          </div>

          {recentlyViewed.length > 0 && activeCategory === 'all' && search.trim() === '' && (
            <div className="tn-recent-section">
              <span className="mm-section-title">🕐 Recently Viewed</span>
              <div className="tn-recent-list">
                {recentlyViewed.map(note => (
                  <div
                    key={note.id}
                    className="tn-recent-item"
                    onClick={() => navigate(`/technotes/${note.id}`)}
                  >
                    {note.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mm-row" style={{ width: '100%' }}>
            <input
              className="mm-search"
              placeholder="Search notes by title, content, tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <select
              className="mm-filter-select"
              value={filterType}
              onChange={e => setFilterType(e.target.value as 'all' | 'text' | 'code')}
            >
              <option value="all">All Types</option>
              <option value="text">📝 Text Notes</option>
              <option value="code">💻 Code Notes</option>
            </select>
          </div>

          <div className="notes-grid">
            {filteredNotes.length === 0 ? (
              <p className="mm-empty mm-empty-state">
                {notes.length === 0 ? 'No notes yet. Create your first note!' : 'No notes match your search.'}
              </p>
            ) : (
              filteredNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={(id) => setConfirmDelete(id)}
                  onTogglePin={handleTogglePin}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {showNewModal && (
        <NewNoteModal
          existingCategories={existingCategories}
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreateNote}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          message="Are you sure you want to delete this note?"
          onConfirm={() => handleDeleteNote(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </Layout>
  )
}

export default TechNotes
