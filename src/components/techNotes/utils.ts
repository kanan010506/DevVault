export function getPreview(content: string): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*_`>~-]/g, '')
    .trim()
  return plain.length > 120 ? plain.slice(0, 120) + '...' : plain
}

export function getUpdatedText(updatedAt: string): string {
  const today = new Date()
  const updated = new Date(updatedAt)
  const days = Math.floor((today.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Updated today'
  if (days === 1) return 'Updated yesterday'
  return `Updated ${days} days ago`
}