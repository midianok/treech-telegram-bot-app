import { useEffect, useMemo, useState } from 'react'
import { useTheme } from './hooks/useTheme'
import { apiFetch } from './api'
import { AiAgent } from './types'
import { Icon, Tab, TabBar, TopBar } from './components/ui'
import { HomeScreen } from './pages/HomePage'
import { AgentsScreen } from './pages/PromptsListPage'
import { EditAgentScreen } from './pages/PromptDetailPage'
import { StatsScreen } from './pages/StatsPage'

const AGENT_COLORS = ['#FF7A59', '#C4B5FD', '#4FCF6A', '#FACC15', '#2AABEE', '#E879F9']
const WRITE_USERS = ['qwrzlp', 'ilya_naprimer']

type View = { kind: 'tab' } | { kind: 'edit'; id: string | null }

export default function App() {
  const theme = useTheme()
  const [tab, setTab] = useState<Tab>('home')
  const [view, setView] = useState<View>({ kind: 'tab' })
  const [agents, setAgents] = useState<AiAgent[]>([])
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  const username = window.Telegram?.WebApp?.initDataUnsafe?.user?.username ?? ''
  const canWrite = import.meta.env.DEV || WRITE_USERS.includes(username)

  const chatId: string | null =
    window.Telegram?.WebApp?.initDataUnsafe?.start_param
    ?? new URLSearchParams(window.location.search).get('chatId')
    ?? import.meta.env.VITE_DEBUG_CHAT_ID
    ?? null

  useEffect(() => {
    window.Telegram?.WebApp?.ready()
  }, [])

  useEffect(() => {
    apiFetch('/saturn-api/api/ai-agents')
      .then(r => r.ok ? r.json() as Promise<AiAgent[]> : [])
      .then(setAgents)
      .catch(() => {})

    if (chatId) {
      apiFetch(`/saturn-api/api/chats/${encodeURIComponent(chatId)}/ai-agent`)
        .then(r => r.ok ? r.json() as Promise<{ id: string }> : null)
        .then(a => { if (a?.id) setActiveAgentId(a.id) })
        .catch(() => {})
    }
  }, [])

  const agentsWithColor = useMemo(
    () => agents.map((a, i) => ({ ...a, color: AGENT_COLORS[i % AGENT_COLORS.length] })),
    [agents]
  )

  const isEditView = view.kind === 'edit'
  const editingId = isEditView ? (view as { kind: 'edit'; id: string | null }).id : null
  const editingAgent = editingId ? (agentsWithColor.find(a => a.id === editingId) ?? null) : null

  const goTab = (t: Tab) => { setView({ kind: 'tab' }); setTab(t) }
  const goEdit = (id: string | null) => setView({ kind: 'edit', id })

  const handleSaveAgent = (id: string | null | undefined, name: string, prompt: string) => {
    const body = JSON.stringify({ name, prompt })
    if (id) {
      apiFetch(`/saturn-api/api/ai-agents/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body,
      }).then(r => {
        if (r.ok) setAgents(prev => prev.map(a => a.id === id ? { ...a, name, prompt } : a))
      })
    } else {
      apiFetch('/saturn-api/api/ai-agents', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
      }).then(r => r.ok ? r.json() as Promise<AiAgent> : null)
        .then(a => { if (a) setAgents(prev => [...prev, a]) })
    }
    goTab('agents')
  }

  const handleDeleteAgent = (id: string) => {
    apiFetch(`/saturn-api/api/ai-agents/${id}`, { method: 'DELETE' })
    setAgents(prev => prev.filter(a => a.id !== id))
    if (activeAgentId === id) setActiveAgentId(null)
    goTab('agents')
  }

  const handleSelectAgent = (id: string) => {
    if (!chatId) return
    apiFetch(`/saturn-api/api/chats/${encodeURIComponent(chatId)}/ai-agent`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: id }),
    }).then(r => { if (r.ok) setActiveAgentId(id) })
  }

  // ── Header config ──
  const chatTitle = window.Telegram?.WebApp?.initDataUnsafe?.chat?.title ?? 'чат'

  let headerTitle = 'Treech'
  let headerSubtitle = 'Управление ботом чата'
  let headerLeading: React.ReactNode = null
  let headerTrailing: React.ReactNode = null

  if (isEditView) {
    headerTitle = editingAgent ? 'Править агента' : 'Новый агент'
    headerSubtitle = editingAgent ? editingAgent.name : 'создайте собственного'
    headerLeading = (
      <button onClick={() => setView({ kind: 'tab' })} style={{
        background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
        display: 'flex', alignItems: 'center', color: theme.accent, fontSize: 16,
        gap: 2, marginLeft: -4,
      }}>
        <Icon name="back" size={24} color={theme.accent} />
        <span style={{ fontWeight: 400 }}>Назад</span>
      </button>
    )
  } else if (tab === 'agents') {
    headerTitle = 'AI-агенты'
    headerSubtitle = `${agentsWithColor.length} профилей · выберите активного`
    if (canWrite) {
      headerTrailing = (
        <button onClick={() => goEdit(null)} style={{
          width: 36, height: 36, borderRadius: 18, background: 'transparent', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icon name="plus" size={22} color={theme.accent} />
        </button>
      )
    }
  } else if (tab === 'stats') {
    headerTitle = 'Статистика чата'
    headerSubtitle = chatTitle
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
      background: theme.bg, overflow: 'hidden',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', system-ui, sans-serif",
      WebkitFontSmoothing: 'antialiased',
    }}>
      <TopBar theme={theme} title={headerTitle} subtitle={headerSubtitle}
        leading={headerLeading} trailing={headerTrailing} />

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {isEditView ? (
          <EditAgentScreen
            theme={theme}
            agent={editingAgent}
            canWrite={canWrite}
            onBack={() => setView({ kind: 'tab' })}
            onSave={handleSaveAgent}
            onDelete={handleDeleteAgent}
          />
        ) : tab === 'home' ? (
          <HomeScreen
            theme={theme}
            chatTitle={chatTitle}
            agents={agentsWithColor}
            activeAgentId={activeAgentId}
            chatId={chatId}
            canWrite={canWrite}
            onGoAgents={() => goTab('agents')}
            onGoStats={() => goTab('stats')}
            onGoEdit={goEdit}
            onGoNew={() => goEdit(null)}
          />
        ) : tab === 'agents' ? (
          <AgentsScreen
            theme={theme}
            agents={agentsWithColor}
            activeAgentId={activeAgentId}
            canWrite={canWrite}
            onSelect={handleSelectAgent}
            onEdit={goEdit}
            onDelete={handleDeleteAgent}
            onNew={() => goEdit(null)}
          />
        ) : (
          <StatsScreen theme={theme} chatId={chatId} />
        )}
      </div>

      {!isEditView && (
        <TabBar theme={theme} active={tab} onChange={goTab} />
      )}
    </div>
  )
}
