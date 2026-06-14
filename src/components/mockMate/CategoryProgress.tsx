import type { Problem } from './types'

interface Props {
  problems: Problem[]
  activeCategory: string
  onCategoryClick: (category: string) => void
}

function CategoryProgress({ problems, activeCategory, onCategoryClick }: Props) {
  const categoryMap: Record<string, { total: number; mastered: number }> = {}

  problems.forEach(p => {
    if (!categoryMap[p.category]) {
      categoryMap[p.category] = { total: 0, mastered: 0 }
    }
    categoryMap[p.category].total++
    if (p.status === 'mastered') categoryMap[p.category].mastered++
  })

  const categories = Object.entries(categoryMap).sort((a, b) => b[1].total - a[1].total)

  if (categories.length === 0) return null

  return (
    <div className="category-progress-card">
      <h3>📈 Category Progress</h3>
      <div className="category-list">
        {categories.map(([category, { total, mastered }]) => {
          const percent = Math.round((mastered / total) * 100)
          const isActive = activeCategory === category
          return (
            <div
              key={category}
              className={`category-row ${isActive ? 'category-row-active' : ''}`}
              onClick={() => onCategoryClick(category === activeCategory ? 'all' : category)}
            >
              <div className="category-row-header">
                <span className="category-name">{category}</span>
                <span className="category-count">{mastered}/{total}</span>
              </div>
              <div className="category-bar">
                <div
                  className="category-bar-fill"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryProgress