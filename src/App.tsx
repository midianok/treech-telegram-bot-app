import { useEffect, useState } from 'react'
import { useTheme } from './hooks/useTheme'
import { HomePage } from './pages/HomePage'
import { StatsPage } from './pages/StatsPage'
import { PromptsListPage } from './pages/PromptsListPage'
import { PromptDetailPage } from './pages/PromptDetailPage'
import { AiAgent } from './types'

export default function App() {
  const [page, setPage] = useState('home')
  const [selectedAgent, setSelectedAgent] = useState<AiAgent | null>(null)
  const theme = useTheme()

  useEffect(() => {
    window.Telegram?.WebApp.ready()
  }, [])

  if (page === 'stats') {
    return <StatsPage theme={theme} onBack={() => setPage('home')} />
  }

  if (page === 'prompts') {
    return (
      <PromptsListPage
        theme={theme}
        onBack={() => setPage('home')}
        onSelect={agent => {
          setSelectedAgent(agent)
          setPage('prompt-detail')
        }}
        onCreate={() => {
          setSelectedAgent(null)
          setPage('prompt-detail')
        }}
      />
    )
  }

  if (page === 'prompt-detail' && selectedAgent) {
    return (
      <PromptDetailPage
        theme={theme}
        agent={selectedAgent}
        onBack={() => setPage('prompts')}
      />
    )
  }

  return <HomePage theme={theme} onNavigate={setPage} />
}
