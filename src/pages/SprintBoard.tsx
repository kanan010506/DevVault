import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import type { DropResult } from '@hello-pangea/dnd'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Layout, ConfirmModal} from '../components/common'
import { KanbanBoard, ProjectModal, ProjectsPanel, TaskModal } from '../components/sprintBoard'
import type { Project, Task } from '../components/sprintBoard/types'
import '../styles/sprintboard.css'

interface TaskCount {
  total: number
  done: number
}

function SprintBoard() {
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [taskCounts, setTaskCounts] = useState<Record<string, TaskCount>>({})
  const [confirmTask, setConfirmTask] = useState<string | null>(null)
  const [confirmProject, setConfirmProject] = useState<string | null>(null)
  const handledTaskLink = useRef(false)


  const fetchAllTaskCounts = async (projectList: Project[]) => {
    const counts: Record<string, TaskCount> = {}
    await Promise.all(projectList.map(async (project) => {
      const { data } = await supabase
        .from('tasks')
        .select('status')
        .eq('project_id', project.id)
      if (data) {
        counts[project.id] = {
          total: data.length,
          done: data.filter(t => t.status === 'done').length
        }
      }
    }))
    setTaskCounts(counts)
  }

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) {
        setProjects(data)
        fetchAllTaskCounts(data)

        const projectId = searchParams.get('project')
        if (projectId) {
          const found = data.find(p => p.id === projectId)
          if (found) setSelectedProject(found)
        }
      }
    }
    fetchProjects()
  }, [searchParams])

  useEffect(() => {
    const fetchTasks = async (projectId: string) => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
      if (data) setTasks(data)
    }
    if (selectedProject) fetchTasks(selectedProject.id)
  }, [selectedProject])

  useEffect(() => {
    if (!selectedProject) return
    if (handledTaskLink.current) return
    const taskId = searchParams.get('task')
    if (!taskId) return
    const found = tasks.find(t => t.id === taskId)
    if (!found) return
    handledTaskLink.current = true
    setEditingTask(found)
  }, [tasks, selectedProject, searchParams])


  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#a78bfa', '#3b82f6', '#34d399', '#f9fafb']
    })
  }

  const handleAddProject = async (name: string, desc: string, status: Project['status']) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('projects').insert({
      name, description: desc, status, user_id: user?.id
    }).select().single()
    if (data) {
      setProjects(prev => [data, ...prev])
      setSelectedProject(data)
      setTaskCounts(prev => ({ ...prev, [data.id]: { total: 0, done: 0 } }))
    }
    setShowProjectModal(false)
  }

  const handleEditProject = async (name: string, desc: string, status: Project['status']) => {
    if (!editingProject) return
    const { data } = await supabase.from('projects').update({
      name, description: desc, status
    }).eq('id', editingProject.id).select().single()
    if (data) {
      setProjects(prev => prev.map(p => p.id === editingProject.id ? data : p))
      if (selectedProject?.id === editingProject.id) setSelectedProject(data)
    }
    setEditingProject(null)
  }

  const handleDeleteProject = async (projectId: string) => {
    await supabase.from('projects').delete().eq('id', projectId)
    setProjects(prev => prev.filter(p => p.id !== projectId))
    if (selectedProject?.id === projectId) {
      setSelectedProject(null)
      setTasks([])
    }
    setTaskCounts(prev => {
      const updated = { ...prev }
      delete updated[projectId]
      return updated
    })
    setConfirmProject(null)
  }

  const handleAddTask = async (title: string, priority: Task['priority'], due: string, status: Task['status'], description: string, tags: string[]) => {
    if (!selectedProject) return
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('tasks').insert({
      title, priority, due_date: due || null,
      status, description: description || null,
      tags, project_id: selectedProject.id, user_id: user?.id
    }).select().single()
    if (data) {
      setTasks(prev => [...prev, data])
      updateTaskCount(selectedProject.id, data.status, 'add')
    }
    setShowTaskModal(false)
  }

  const handleEditTask = async (title: string, priority: Task['priority'], due: string, status: Task['status'], description: string, tags: string[]) => {
    if (!editingTask) return
    const { data } = await supabase.from('tasks').update({
      title, priority, due_date: due || null,
      status, description: description || null, tags
    }).eq('id', editingTask.id).select().single()
    if (data) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? data : t))
      if (editingTask.status !== status) fetchAllTaskCounts(projects)
    }
    setEditingTask(null)
  }

  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    await supabase.from('tasks').delete().eq('id', taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
    if (task && selectedProject) updateTaskCount(selectedProject.id, task.status, 'remove')
    setConfirmTask(null)
  }

  const handleCompleteTask = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
    const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t)
    setTasks(updatedTasks as Task[])
    if (selectedProject) {
      fetchAllTaskCounts(projects)
      const allDone = updatedTasks.every(t => t.status === 'done')
      if (allDone && updatedTasks.length > 0 && newStatus === 'done') triggerConfetti()
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    const taskId = result.draggableId
    const newStatus = result.destination.droppableId as Task['status']
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    setTasks(updatedTasks)
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    fetchAllTaskCounts(projects)
    const allDone = updatedTasks.every(t => t.status === 'done')
    if (allDone && updatedTasks.length > 0 && newStatus === 'done') triggerConfetti()
  }

  const updateTaskCount = (projectId: string, status: string, action: 'add' | 'remove') => {
    setTaskCounts(prev => {
      const current = prev[projectId] || { total: 0, done: 0 }
      const delta = action === 'add' ? 1 : -1
      return {
        ...prev,
        [projectId]: {
          total: current.total + delta,
          done: status === 'done' ? current.done + delta : current.done
        }
      }
    })
  }

  return (
    <Layout>
      <div className="sprintboard">
        <ProjectsPanel
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          onNewProject={() => setShowProjectModal(true)}
          onEditProject={(project) => setEditingProject(project)}
          onDeleteProject={(projectId) => setConfirmProject(projectId)}
          taskCounts={taskCounts}
        />

        {selectedProject ? (
          <KanbanBoard
            selectedProject={selectedProject}
            tasks={tasks}
            onDragEnd={handleDragEnd}
            onAddTask={() => setShowTaskModal(true)}
            onEditTask={(task) => setEditingTask(task)}
            onDeleteTask={(taskId) => setConfirmTask(taskId)}
            onCompleteTask={handleCompleteTask}
          />
        ) : (
          <div className="kanban-empty">← Select a project to view tasks</div>
        )}
      </div>

      {(showProjectModal || editingProject) && (
        <ProjectModal
          onClose={() => { setShowProjectModal(false); setEditingProject(null) }}
          onSave={editingProject ? handleEditProject : handleAddProject}
          editProject={editingProject}
        />
      )}

      {(showTaskModal || editingTask) && (
        <TaskModal
          onClose={() => { setShowTaskModal(false); setEditingTask(null) }}
          onSave={editingTask ? handleEditTask : handleAddTask}
          editTask={editingTask}
        />
      )}

      {confirmTask && (
        <ConfirmModal
          message="Are you sure you want to delete this task?"
          onConfirm={() => handleDeleteTask(confirmTask)}
          onCancel={() => setConfirmTask(null)}
        />
      )}

      {confirmProject && (
        <ConfirmModal
          message="Are you sure? This will delete the project and all its tasks."
          onConfirm={() => handleDeleteProject(confirmProject)}
          onCancel={() => setConfirmProject(null)}
        />
      )}
    </Layout>
  )
}

export default SprintBoard
