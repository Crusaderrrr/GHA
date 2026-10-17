import { BrowserRouter, Link, Route, Routes } from 'react-router'
import TrendingPage from './pages/TrendingPage'
import RepoPage from './pages/RepoPage'

export default function App() {
  return (
    <BrowserRouter>
      <header>
        <Link to="/">GHA Trending</Link>
        {/* TODO stage 8: GitHub login */}
      </header>
      <main>
        <Routes>
          <Route path="/" element={<TrendingPage />} />
          <Route path="/repo/:owner/:name" element={<RepoPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
