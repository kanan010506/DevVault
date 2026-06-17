import type { Note } from './types'

interface Props {
  notes: Note[]
  activeCategory: string
  onCategoryClick: (category: string) => void
}

function CategorySidebar({ notes, activeCategory, onCategoryClick }: Props) {
  const categoryCounts: Record<string, number> = {}
  notes.forEach(n => {
    categoryCounts[n.category] = (categoryCounts[n.category] || 0) + 1
  })

  const categories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])

  return (
    <div className="tn-category-sidebar">
      <h2>Categories</h2>
      <div
        className={`tn-category-item ${activeCategory === 'all' ? 'active' : ''}`}
        onClick={() => onCategoryClick('all')}
      >
        <span>📁 All</span>
        <span className="tn-category-count">{notes.length}</span>
      </div>
      {categories.map(([category, count]) => (
        <div
          key={category}
          className={`tn-category-item ${activeCategory === category ? 'active' : ''}`}
          onClick={() => onCategoryClick(category)}
        >
          <span>📁 {category}</span>
          <span className="tn-category-count">{count}</span>
        </div>
      ))}
    </div>
  )
}

export default CategorySidebar