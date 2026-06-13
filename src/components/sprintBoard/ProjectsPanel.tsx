import { useState } from 'react'
import type { Project } from './types'

interface TaskCount {
  total: number
  done: number
}

interface Props {
  projects: Project[]
  selectedProject: Project | null
  onSelectProject: (project: Project) => void
  onNewProject: () => void
  onDeleteProject: (projectId: string) => void
  onEditProject: (project: Project) => void
  taskCounts: Record<string, TaskCount>
}

function ProjectsPanel({ projects, selectedProject, onSelectProject, onNewProject, onDeleteProject, onEditProject, taskCounts }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="projects-panel">
      <h2>Projects</h2>
      <button className="new-project-btn" onClick={onNewProject}>
        + New Project
      </button>
      {projects.map(project => {
        const count = taskCounts[project.id] || { total: 0, done: 0 }
        const percent = count.total > 0 ? Math.round((count.done / count.total) * 100) : 0

        return (
          <div
            key={project.id}
            className={`project-item ${selectedProject?.id === project.id ? 'active' : ''}`}
            onClick={() => onSelectProject(project)}
            onMouseEnter={() => setHoveredId(project.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="project-item-top">
              <span className={`project-dot ${project.status === 'on hold' ? 'on-hold' : project.status === 'completed' ? 'completed' : ''}`} />
              <span className="project-name">{project.name}</span>
              {hoveredId === project.id ? (
                <div className="project-actions">
                  <button
                    className="project-action-btn"
                    onClick={e => { e.stopPropagation(); onEditProject(project) }}
                  >✏️</button>
                  <button
                    className="project-action-btn"
                    onClick={e => { e.stopPropagation(); onDeleteProject(project.id) }}
                  >🗑️</button>
                </div>
              ) : (
                <span className="project-count">{count.done}/{count.total}</span>
              )}
            </div>
            <div className="project-progress-bar">
              <div className="project-progress-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ProjectsPanel