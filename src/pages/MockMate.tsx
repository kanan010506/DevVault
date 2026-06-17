import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Layout } from '../components/common'
import { ProblemCard, ProblemModal, FlashcardReview, DailyGoal, CategoryProgress, MockMateSettings } from '../components/mockMate'
import type { Problem, DailyGoal as DailyGoalType, MockMateSettings as SettingsType } from '../components/mockMate/types'
import {getLocalDateString, getStreak, getTodayCount, getDueProblems} from '../components/mockMate/utils.ts'
import '../styles/mockmate.css'

type SortOption = 'overdue' | 'problem_number' | 'difficulty' | 'confidence' | 'date'
type FilterDifficulty = 'all' | 'easy' | 'medium' | 'hard'
type FilterStatus = 'all' | 'failed' | 'revisiting' | 'mastered'

const DEFAULT_SETTINGS: SettingsType = {
  id: '',
  user_id: '',
  failed_interval: 1,
  revisiting_interval: 3,
  mastered_interval: 7,
  preferred_language: 'Python3',
  best_streak: 0,
}

const DEFAULT_GOAL: DailyGoalType = {
  id: '',
  user_id: '',
  easy_target: 0,
  medium_target: 0,
  hard_target: 0,
}

function MockMate() {
  const [searchParams] = useSearchParams()
  const [problems, setProblems] = useState<Problem[]>([])
  const [goal, setGoal] = useState<DailyGoalType>(DEFAULT_GOAL)
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS)
  const [showProblemModal, setShowProblemModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null)
  const [reviewProblems, setReviewProblems] = useState<Problem[] | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('overdue')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filterDifficulty, setFilterDifficulty] = useState<FilterDifficulty>('all')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterConfidence, setFilterConfidence] = useState<number | 'all'>('all')
  const [showReviewPrompt, setShowReviewPrompt] = useState(false)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const handledProblemLink = useRef(false)

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds)
    await supabase.from('problems').delete().in('id', ids)
    setProblems(prev => prev.filter(p => !selectedIds.has(p.id)))
    setSelectedIds(new Set())
    setSelectMode(false)
  }

  const handleBulkStatusChange = async (status: Problem['status']) => {
    const ids = Array.from(selectedIds)
    await supabase.from('problems').update({ status }).in('id', ids)
    setProblems(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, status } : p))
    setSelectedIds(new Set())
    setSelectMode(false)
  }

  const handleTogglePin = async (problem: Problem) => {
    const { data } = await supabase.from('problems').update({
      pinned: !problem.pinned
    }).eq('id', problem.id).select().single()
    if (data) setProblems(prev => prev.map(p => p.id === problem.id ? data : p))
  }

  useEffect(() => {
    const fetchAll = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: problemsData }, { data: goalData }, { data: settingsData }] =
        await Promise.all([
          supabase.from('problems').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('daily_goals').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('mockmate_settings').select('*').eq('user_id', user.id).maybeSingle(),
        ])

      if (problemsData) setProblems(problemsData)
      if (goalData) setGoal(goalData)
      if (settingsData) setSettings(settingsData)
    }
    fetchAll()
  }, [])

  const handleResetProblem = async (problem: Problem) => {
    const { data } = await supabase.from('problems').update({
      status: 'failed',
      next_review_date: getLocalDateString(),
      confidence: 1,
      last_reviewed_at: null,
    }).eq('id', problem.id).select().single()
    if (data) setProblems(prev => prev.map(p => p.id === problem.id ? data : p))
  }

  const handleAddProblem = async (problem: Partial<Problem>) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('problems').insert({
      ...problem,
      user_id: user?.id,
      next_review_date: getLocalDateString(),
    }).select().single()
    if (data) {
      setProblems(prev => [data, ...prev])
      setShowProblemModal(false)
      setShowReviewPrompt(true)
    }
  }

  const handleEditProblem = async (problem: Partial<Problem>) => {
    if (!editingProblem) return
    const { data } = await supabase.from('problems').update(problem)
      .eq('id', editingProblem.id).select().single()
    if (data) setProblems(prev => prev.map(p => p.id === editingProblem.id ? data : p))
    setEditingProblem(null)
  }

  const handleDeleteProblem = async (id: string) => {
    await supabase.from('problems').delete().eq('id', id)
    setProblems(prev => prev.filter(p => p.id !== id))
  }

  const handleReviewComplete = async (problemId: string, newDate: string, newStatus: Problem['status']) => {
    const { data } = await supabase.from('problems').update({
      next_review_date: newDate,
      status: newStatus,
      last_reviewed_at: new Date().toISOString(),
    }).eq('id', problemId).select().single()
    if (data) setProblems(prev => prev.map(p => p.id === problemId ? data : p))
  }

  const handleUpdateProblem = async (problemId: string, notes: string, solution: string, solutionLanguage: string) => {
    const { data } = await supabase.from('problems').update({
      notes: notes || null,
      solution: solution || null,
      solution_language: solutionLanguage,
    }).eq('id', problemId).select().single()
    if (data) setProblems(prev => prev.map(p => p.id === problemId ? data : p))
  }

  const handleReviewExit = () => {
    setReviewProblems(null)
    const allDue = getDueProblems(problems)
    if (allDue.length === 0) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#a78bfa', '#3b82f6', '#34d399'] })
    }
  }

  const handleSaveGoal = async (newGoal: Partial<DailyGoalType>) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('daily_goals').upsert({
      ...newGoal,
      user_id: user?.id,
    }, { onConflict: 'user_id' }).select().single()
    if (data) setGoal(data)
    setShowGoalModal(false)
  }

  const handleSaveSettings = async (newSettings: Partial<SettingsType>) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('mockmate_settings').upsert({
      ...newSettings,
      user_id: user?.id,
    }, { onConflict: 'user_id' }).select().single()
    if (data) setSettings(data)
  }

  const getSortedFilteredProblems = () => {
    const today = getLocalDateString()
    const filtered = problems.filter(p => {
      const matchesSearch = search.trim() === '' ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
        p.problem_number?.toString().includes(search)
      const matchesDifficulty = filterDifficulty === 'all' || p.difficulty === filterDifficulty
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus
      const matchesCategory = filterCategory === 'all' || p.category === filterCategory
      const matchesConfidence = filterConfidence === 'all' || p.confidence <= filterConfidence
      return matchesSearch && matchesDifficulty && matchesStatus && matchesCategory && matchesConfidence
    })

    filtered.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1

      const getResult = () => {
        if (sortBy === 'overdue') {
          const aDays = new Date(today).getTime() - new Date(a.next_review_date).getTime()
          const bDays = new Date(today).getTime() - new Date(b.next_review_date).getTime()
          return bDays - aDays
        }
        if (sortBy === 'problem_number') return (a.problem_number || 0) - (b.problem_number || 0)
        if (sortBy === 'difficulty') {
          const order = { easy: 0, medium: 1, hard: 2 }
          return order[a.difficulty] - order[b.difficulty]
        }
        if (sortBy === 'confidence') return a.confidence - b.confidence
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return sortDir === 'asc' ? getResult() : -getResult()
    })

    return filtered
  }

  const dueProblems = getDueProblems(problems)
  const streak = getStreak(problems, goal)
  const todayCount = getTodayCount(problems)

  useEffect(() => {
    if (settings.best_streak >= streak) return
    const updateBest = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from('mockmate_settings').upsert({
        user_id: user.id,
        failed_interval: settings.failed_interval,
        revisiting_interval: settings.revisiting_interval,
        mastered_interval: settings.mastered_interval,
        preferred_language: settings.preferred_language,
        best_streak: streak,
      }, { onConflict: 'user_id' }).select().single()

      if (data) setSettings(data)
    }
    updateBest()
  }, [streak, settings])

  useEffect(() => {
    if (handledProblemLink.current) return
    const id = searchParams.get('problem')
    if (!id) return
    const found = problems.find(p => p.id === id)
    if (!found) return
    handledProblemLink.current = true
    setEditingProblem(found)
  }, [problems, searchParams])

  if (reviewProblems) {
    return (
      <FlashcardReview
        problems={reviewProblems}
        settings={settings}
        onComplete={handleReviewComplete}
        onExit={handleReviewExit}
        onUpdateProblem={handleUpdateProblem}
      />
    )
  }

  return (
    <Layout>
      <div className="mockmate">

        {/* ── Top Bar ── */}
        <div className="mm-topbar">
          <div className="mm-topbar-left">
            <div className="mm-streak">
              🔥 <span className="mm-streak-count">{streak}</span> day streak
              <span className="mm-best-streak">🏆 Best: {settings.best_streak}</span>
            </div>
          </div>
          <div className="mm-topbar-actions">
            <button className="mm-settings-btn" onClick={() => setShowSettingsModal(true)}>
              ⚙️ Settings
            </button>
            <button className="mm-log-btn" onClick={() => setShowProblemModal(true)}>
              + Log Problem
            </button>
          </div>
        </div>

        {/* ── Daily Goal ── */}
        <DailyGoal
          goal={goal}
          todayCount={todayCount}
          onEditGoal={() => setShowGoalModal(true)}
        />

        {/* ── Due for Review ── */}
        {dueProblems.length > 0 && (
          <div>
            <div className="mm-section-header">
              <span className="mm-section-title">⚡ Due for Review ({dueProblems.length})</span>
              <button
                className="mm-start-review-btn"
                onClick={() => setReviewProblems(dueProblems)}
              >
                Start Review →
              </button>
            </div>
            <div className="problem-list">
              {dueProblems.slice(0, 3).map(p => (
                <ProblemCard
                  key={p.id}
                  problem={p}
                  onReset={handleResetProblem}
                  onEdit={setEditingProblem}
                  onDelete={handleDeleteProblem}
                  onReview={(problem) => setReviewProblems([problem])}
                  onTogglePin={handleTogglePin}
                />
              ))}
              {dueProblems.length > 3 && (
                <p className="mm-empty mm-empty-inline">+{dueProblems.length - 3} more due problems</p>
              )}
            </div>
          </div>
        )}

        {/* ── Category Progress ── */}
        <CategoryProgress
          problems={problems}
          activeCategory={filterCategory}
          onCategoryClick={(category) => setFilterCategory(category)}
        />

        {/* ── Library ── */}
        <div>
          <div className="mm-section-header">
            <span className="mm-section-title">📚 Library ({problems.length})</span>
          </div>
          <div className="mm-library-header">
            <input
              className="mm-search"
              placeholder="Search problems..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="mm-filter-select"
              value={filterDifficulty}
              onChange={e => setFilterDifficulty(e.target.value as FilterDifficulty)}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select
              className="mm-filter-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as FilterStatus)}
            >
              <option value="all">All Status</option>
              <option value="failed">Failed</option>
              <option value="revisiting">Revisiting</option>
              <option value="mastered">Mastered</option>
            </select>
            <select
              className="mm-filter-select"
              value={filterConfidence}
              onChange={e => setFilterConfidence(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
              <option value="all">All Confidence</option>
              <option value={1}>⭐ Max 1</option>
              <option value={2}>⭐⭐ Max 2</option>
              <option value={3}>⭐⭐⭐ Max 3</option>
              <option value={4}>⭐⭐⭐⭐ Max 4</option>
              <option value={5}>⭐⭐⭐⭐⭐ Max 5</option>
            </select>
            <select
              className="mm-filter-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
            >
              <option value="overdue">Sort: Overdue First</option>
              <option value="problem_number">Sort: Problem #</option>
              <option value="difficulty">Sort: Difficulty</option>
              <option value="confidence">Sort: Confidence</option>
              <option value="date">Sort: Date Added</option>
            </select>
            <button
              className="mm-sort-dir-btn"
              onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
            {filterCategory !== 'all' && (
              <button
                className="mm-sort-dir-btn"
                onClick={() => setFilterCategory('all')}
              >
                ✕ {filterCategory}
              </button>
            )}
            <button
              className={`mm-select-toggle ${selectMode ? 'active' : ''}`}
              onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()) }}
            >
              {selectMode ? '✕ Cancel' : '☑️ Select'}
            </button>
          </div>
          <br />
          <div className="problem-list">
            {getSortedFilteredProblems().length === 0 ? (
              <p className="mm-empty mm-empty-state">No problems found. Log your first problem!</p>
            ) : (
              getSortedFilteredProblems().map(p => (
                <ProblemCard
                  key={p.id}
                  problem={p}
                  onReset={handleResetProblem}
                  onEdit={setEditingProblem}
                  onDelete={handleDeleteProblem}
                  onReview={(problem) => setReviewProblems([problem])}
                  onTogglePin={handleTogglePin}
                  selectMode={selectMode}
                  isSelected={selectedIds.has(p.id)}
                  onToggleSelect={toggleSelect}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Bulk Action Bar ── */}
      {selectMode && selectedIds.size > 0 && (
        <div className="mm-bulk-bar">
          <span className="mm-bulk-count">{selectedIds.size} selected</span>
          <div className="mm-bulk-actions-group">
            <button className="mm-sort-dir-btn" onClick={() => handleBulkStatusChange('failed')}>🔴 Failed</button>
            <button className="mm-sort-dir-btn" onClick={() => handleBulkStatusChange('revisiting')}>🟡 Revisiting</button>
            <button className="mm-sort-dir-btn" onClick={() => handleBulkStatusChange('mastered')}>🟢 Mastered</button>
            <button className="btn-delete" onClick={handleBulkDelete}>🗑️ Delete</button>
          </div>
        </div>
      )}

      {/* ── Review Prompt after logging ── */}
      {showReviewPrompt && dueProblems.length > 0 && (
        <div className="modal-overlay" onClick={() => setShowReviewPrompt(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Want to review now?</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              You have {dueProblems.length} problem{dueProblems.length > 1 ? 's' : ''} due for review.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowReviewPrompt(false)}>Skip</button>
              <button className="btn-save" onClick={() => {
                setShowReviewPrompt(false)
                setReviewProblems(dueProblems)
              }}>
                Start Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Goal Modal ── */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={() => setShowGoalModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Set Daily Goal</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="mm-row">
                <label style={{ color: '#34d399', fontSize: '0.85rem', width: '80px' }}>Easy</label>
                <input
                  type="number"
                  min={0}
                  defaultValue={goal.easy_target}
                  id="easy-target"
                  className="mm-input"
                  style={{ width: '90px', flexShrink: 0 }}
                />
              </div>
              <div className="mm-row">
                <label style={{ color: '#fbbf24', fontSize: '0.85rem', width: '80px' }}>Medium</label>
                <input
                  type="number"
                  min={0}
                  defaultValue={goal.medium_target}
                  id="medium-target"
                  className="mm-input"
                  style={{ width: '90px', flexShrink: 0 }}
                />
              </div>
              <div className="mm-row">
                <label style={{ color: '#f87171', fontSize: '0.85rem', width: '80px' }}>Hard</label>
                <input
                  type="number"
                  min={0}
                  defaultValue={goal.hard_target}
                  id="hard-target"
                  className="mm-input"
                  style={{ width: '90px', flexShrink: 0 }}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowGoalModal(false)}>Cancel</button>
              <button className="btn-save" onClick={() => {
                const easy = Number((document.getElementById('easy-target') as HTMLInputElement).value)
                const medium = Number((document.getElementById('medium-target') as HTMLInputElement).value)
                const hard = Number((document.getElementById('hard-target') as HTMLInputElement).value)
                handleSaveGoal({ easy_target: easy, medium_target: medium, hard_target: hard })
              }}>
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {(showProblemModal || editingProblem) && (
        <ProblemModal
          onClose={() => { setShowProblemModal(false); setEditingProblem(null) }}
          onSave={editingProblem ? handleEditProblem : handleAddProblem}
          editProblem={editingProblem}
          preferredLanguage={settings.preferred_language}
        />
      )}

      {showSettingsModal && (
        <MockMateSettings
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </Layout>
  )
}

export default MockMate
