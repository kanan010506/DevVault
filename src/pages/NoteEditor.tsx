import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '../lib/supabaseClient'
import { Layout } from '../components/common'
import { CodeBlock } from '../components/techNotes'
import type { Note } from '../components/techNotes/types'
import '../styles/technotes.css'

function NoteEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return
      const { data } = await supabase.from('notes').select('*').eq('id', id).single()
      if (data) {
        setNote(data)
        setTitle(data.title)
        setContent(data.content)
        setTagInput(data.tags?.join(', ') || '')
        setMode(data.note_type === 'code' && data.content ? 'preview' : 'edit')

        await supabase.from('notes').update({
          view_count: data.view_count + 1,
          last_viewed_at: new Date().toISOString(),
        }).eq('id', id)
      }
    }
    fetchNote()
  }, [id])

  const saveNote = useCallback(async (newTitle: string, newContent: string, newTags: string[]) => {
    if (!id) return
    setSaveStatus('saving')
    await supabase.from('notes').update({
      title: newTitle,
      content: newContent,
      tags: newTags,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    setSaveStatus('saved')
  }, [id])

  // debounced auto-save
  useEffect(() => {
    if (!note) return
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      const tags = tagInput.split(',').map(t => t.trim()).filter(t => t !== '')
      saveNote(title, content, tags)
    }, 1200)

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, tagInput])

  const handleExport = () => {
    const blob = new Blob([`# ${title}\n\n${content}`], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '_') || 'note'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!note) {
    return (
      <Layout>
        <div className="tn-editor-page">
          <p className="mm-empty">Loading note...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="tn-editor-page">
        <div className="tn-editor-header">
          <button className="tn-editor-back" onClick={() => navigate('/technotes')}>
            ← Back to Notes
          </button>
          <div className="tn-editor-actions">
            <span className="tn-save-status">
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : ''}
            </span>
            <button className="mm-sort-dir-btn" onClick={handleExport}>
              📤 Export .md
            </button>
            <button
              className={`tn-toggle-btn ${mode === 'edit' ? 'active' : ''}`}
              onClick={() => setMode('edit')}
            >
              ✏️ Edit
            </button>
            <button
              className={`tn-toggle-btn ${mode === 'preview' ? 'active' : ''}`}
              onClick={() => setMode('preview')}
            >
              👁 Preview
            </button>
          </div>
        </div>

        <input
          className="tn-editor-title-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Note title"
        />

        <div className="tn-editor-meta">
          <span className="note-category">{note.category}</span>
          <input
            className="mm-input"
            placeholder="Tags (comma separated)"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
        </div>

        {mode === 'edit' ? (
          <textarea
            className="tn-editor-textarea"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your note in markdown..."
          />
        ) : (
          <div className="tn-preview">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const isInline = !match
                  if (isInline) {
                    return <code className={className} {...props}>{children}</code>
                  }
                  return (
                    <CodeBlock
                      language={match[1]}
                      value={String(children).replace(/\n$/, '')}
                    />
                  )
                }
              }}
            >
              {content || '*Nothing to preview yet. Start writing!*'}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default NoteEditor