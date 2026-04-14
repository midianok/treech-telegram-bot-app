import { useEffect, useState } from 'react'
import { useTheme } from './hooks/useTheme'
import { HomePage } from './pages/HomePage'
import { StatsPage } from './pages/StatsPage'

export default function App() {
  const [page, setPage] = useState('home')
  const theme = useTheme()

  useEffect(() => {
    window.Telegram?.WebApp.ready()
  }, [])

  if (page === 'stats') {
    return <StatsPage theme={theme} onBack={() => setPage('home')} />
  }

  return <HomePage theme={theme} onNavigate={setPage} />
}
