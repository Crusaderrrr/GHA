import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { fetchHistory, type HistoryPoint } from '../api'

export default function RepoPage() {
  const { owner = '', name = '' } = useParams()
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const [error, setError] = useState<string>()

  useEffect(() => {
    fetchHistory(owner, name).then(setHistory, (e: Error) => setError(e.message))
  }, [owner, name])

  return (
    <>
      <p>
        <Link to="/">← Trending</Link>
      </p>
      <h1>
        <a href={`https://github.com/${owner}/${name}`} target="_blank" rel="noreferrer">
          {owner}/{name}
        </a>
      </h1>
      {/* TODO stage 8: star button (backend calls GitHub with the user's token) */}
      {error && <p className="error">{error}</p>}
      {history.length === 0 ? (
        <p>No history yet.</p>
      ) : (
        // TODO: replace with a chart
        <table>
          <thead>
            <tr>
              <th>Hour (UTC)</th>
              <th>Stars</th>
              <th>Forks</th>
              <th>Events</th>
            </tr>
          </thead>
          <tbody>
            {history.map((p) => (
              <tr key={p.hour}>
                <td>{p.hour}</td>
                <td>{p.stars}</td>
                <td>{p.forks}</td>
                <td>{p.events}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
