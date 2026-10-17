import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { fetchTrends, type TrendingRepo, type TrendsQuery } from '../api'

export default function TrendingPage() {
  const [query, setQuery] = useState<TrendsQuery>({ window: '24h' })
  const [repos, setRepos] = useState<TrendingRepo[]>([])
  const [error, setError] = useState<string>()

  useEffect(() => {
    fetchTrends(query).then(setRepos, (e: Error) => setError(e.message))
  }, [query])

  const num = (v: string) => (v === '' ? undefined : Number(v))

  return (
    <>
      <h1>Trending repos</h1>
      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <select
          value={query.window}
          onChange={(e) => setQuery({ ...query, window: e.target.value as TrendsQuery['window'] })}
        >
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7 days</option>
        </select>
        <input
          type="number"
          min={0}
          placeholder="Min stars"
          onChange={(e) => setQuery({ ...query, minStars: num(e.target.value) })}
        />
        <input
          type="number"
          min={0}
          placeholder="Max stars"
          onChange={(e) => setQuery({ ...query, maxStars: num(e.target.value) })}
        />
        <input
          placeholder="Language"
          onChange={(e) => setQuery({ ...query, language: e.target.value || undefined })}
        />
      </form>

      {error && <p className="error">{error}</p>}
      {repos.length === 0 ? (
        <p>No data yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Repo</th>
              <th>Language</th>
              <th>Stars in window</th>
              <th>Total stars</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {repos.map((r) => (
              <tr key={r.repoId}>
                <td>
                  <Link to={`/repo/${r.name}`}>{r.name}</Link>
                </td>
                <td>{r.language ?? '—'}</td>
                <td>{r.starsInWindow}</td>
                <td>{r.totalStars ?? '—'}</td>
                <td>{r.score.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
