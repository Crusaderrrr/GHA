// Mirrors the records in backend com.gha.trends.TrendsController.
export type TrendingRepo = {
  repoId: number
  name: string // owner/repo
  language: string | null
  totalStars: number | null
  starsInWindow: number
  forksInWindow: number
  score: number
}

export type HistoryPoint = {
  hour: string
  stars: number
  forks: number
  events: number
}

export type TrendsQuery = {
  window: '24h' | '7d'
  minStars?: number
  maxStars?: number
  language?: string
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export function fetchTrends(q: TrendsQuery) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(q)) if (v !== undefined && v !== '') params.set(k, String(v))
  return get<TrendingRepo[]>(`/api/trends?${params}`)
}

export function fetchHistory(owner: string, name: string) {
  return get<HistoryPoint[]>(`/api/repos/${owner}/${name}/history`)
}
