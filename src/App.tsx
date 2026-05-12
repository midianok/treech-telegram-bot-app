import { useEffect, useMemo, useState } from 'react'
import { useTheme } from './hooks/useTheme'
import { apiFetch } from './api'
import { AiAgent, ImagePrompt } from './types'
import { Icon, Tab, TabBar, TopBar } from './components/ui'
import { HomeScreen } from './pages/HomePage'
import { AgentsScreen } from './pages/PromptsListPage'
import { EditAgentScreen } from './pages/PromptDetailPage'
import { StatsScreen } from './pages/StatsPage'
import { ImagePromptListScreen } from './pages/ImagePromptListPage'
import { EditImagePromptScreen } from './pages/ImagePromptDetailPage'
import { BottomSheet } from './components/BottomSheet'

const AGENT_COLORS = ['#FF7A59', '#C4B5FD', '#4FCF6A', '#FACC15', '#2AABEE', '#E879F9']
const WRITE_USERS = ['qwrzlp', 'ilya_naprimer']

type View =
  | { kind: 'tab' }
  | { kind: 'edit-agent'; id: string | null }
  | { kind: 'edit-image-prompt'; id: string | null }

export default function App() {
  const theme = useTheme()
  const [tab, setTab] = useState<Tab>('home')
  const [view, setView] = useState<View>({ kind: 'tab' })
  const [agents, setAgents] = useState<AiAgent[]>([])
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [imagePrompts, setImagePrompts] = useState<ImagePrompt[]>([])

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
    apiFetch('/api/ai-agents')
      .then(r => r.ok ? r.json() as Promise<AiAgent[]> : [])
      .then(setAgents)
      .catch(() => {})

    apiFetch('/api/image-prompts')
      .then(r => r.ok ? r.json() as Promise<ImagePrompt[]> : [])
      .then(setImagePrompts)
      .catch(() => {})

    if (chatId) {
      apiFetch(`/api/chats/${encodeURIComponent(chatId)}/ai-agent`)
        .then(r => r.ok ? r.json() as Promise<{ id: string }> : null)
        .then(a => { if (a?.id) setActiveAgentId(a.id) })
        .catch(() => {})
    }
  }, [])

  const agentsWithColor = useMemo(
    () => agents.map((a, i) => ({ ...a, color: AGENT_COLORS[i % AGENT_COLORS.length] })),
    [agents]
  )

  const isEditAgent = view.kind === 'edit-agent'
  const isEditImagePrompt = view.kind === 'edit-image-prompt'
  const isEditView = isEditAgent || isEditImagePrompt

  const editingAgentId = isEditAgent ? (view as { kind: 'edit-agent'; id: string | null }).id : null
  const editingAgent = editingAgentId ? (agentsWithColor.find(a => a.id === editingAgentId) ?? null) : null

  const editingImagePromptId = isEditImagePrompt ? (view as { kind: 'edit-image-prompt'; id: string | null }).id : null
  const editingImagePrompt = editingImagePromptId ? (imagePrompts.find(p => p.id === editingImagePromptId) ?? null) : null

  const goTab = (t: Tab) => { setView({ kind: 'tab' }); setTab(t) }
  const goEditAgent = (id: string | null) => setView({ kind: 'edit-agent', id })
  const goEditImagePrompt = (id: string | null) => setView({ kind: 'edit-image-prompt', id })
  const closeModal = () => setView({ kind: 'tab' })

  const handleSaveAgent = (id: string | null | undefined, name: string, prompt: string) => {
    const body = JSON.stringify({ name, prompt })
    if (id) {
      apiFetch(`/api/ai-agents/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body,
      }).then(r => {
        if (r.ok) setAgents(prev => prev.map(a => a.id === id ? { ...a, name, prompt } : a))
      })
    } else {
      apiFetch('/api/ai-agents', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
      }).then(r => r.ok ? r.json() as Promise<AiAgent> : null)
        .then(a => { if (a) setAgents(prev => [...prev, a]) })
    }
    closeModal()
  }

  const handleDeleteAgent = (id: string) => {
    apiFetch(`/api/ai-agents/${id}`, { method: 'DELETE' })
    setAgents(prev => prev.filter(a => a.id !== id))
    if (activeAgentId === id) setActiveAgentId(null)
    closeModal()
  }

  const handleSelectAgent = (id: string) => {
    if (!chatId) return
    apiFetch(`/api/chats/${encodeURIComponent(chatId)}/ai-agent`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: id }),
    }).then(r => { if (r.ok) setActiveAgentId(id) })
  }

  const handleSaveImagePrompt = (id: string | null | undefined, name: string, keywords: string, prompt: string) => {
    const body = JSON.stringify({ name, keywords, prompt })
    if (id) {
      apiFetch(`/api/image-prompts/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body,
      }).then(r => {
        if (r.ok) setImagePrompts(prev => prev.map(p => p.id === id ? { ...p, name, keywords, prompt } : p))
      })
    } else {
      apiFetch('/api/image-prompts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
      }).then(r => r.ok ? r.json() as Promise<ImagePrompt> : null)
        .then(p => { if (p) setImagePrompts(prev => [...prev, p]) })
    }
    closeModal()
  }

  const handleDeleteImagePrompt = (id: string) => {
    apiFetch(`/api/image-prompts/${id}`, { method: 'DELETE' })
    setImagePrompts(prev => prev.filter(p => p.id !== id))
    closeModal()
  }

  const chatTitle = window.Telegram?.WebApp?.initDataUnsafe?.chat?.title ?? 'чат'

  let headerTitle = 'Treech'
  let headerSubtitle = 'Управление ботом чата'
  let headerTrailing: React.ReactNode = null

  if (tab === 'agents') {
    headerTitle = 'AI-агенты'
    headerSubtitle = `${agentsWithColor.length} профилей · выберите активного`
    if (canWrite) {
      headerTrailing = (
        <button onClick={() => goEditAgent(null)} style={{
          width: 36, height: 36, borderRadius: 18, background: 'transparent', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icon name="plus" size={22} color={theme.accent} />
        </button>
      )
    }
  } else if (tab === 'image-prompts') {
    headerTitle = 'Промпты изображений'
    headerSubtitle = `${imagePrompts.length} промптов`
    if (canWrite) {
      headerTrailing = (
        <button onClick={() => goEditImagePrompt(null)} style={{
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

  const sheetTitle = isEditAgent
    ? (editingAgent ? 'Редактировать агента' : 'Новый агент')
    : isEditImagePrompt
    ? (editingImagePrompt ? 'Редактировать промпт' : 'Новый промпт')
    : ''

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
      background: theme.bg, overflow: 'hidden',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', system-ui, sans-serif",
      WebkitFontSmoothing: 'antialiased',
    }}>
      <TopBar theme={theme} title={headerTitle} subtitle={headerSubtitle} trailing={headerTrailing} />

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'home' ? (
          <HomeScreen
            theme={theme}
            chatTitle={chatTitle}
            agents={agentsWithColor}
            activeAgentId={activeAgentId}
            chatId={chatId}
            canWrite={canWrite}
            onGoAgents={() => goTab('agents')}
            onGoStats={() => goTab('stats')}
            onGoImagePrompts={() => goTab('image-prompts')}
            onGoEdit={goEditAgent}
            onGoNew={() => goEditAgent(null)}
            onGoNewImagePrompt={() => goEditImagePrompt(null)}
          />
        ) : tab === 'agents' ? (
          <AgentsScreen
            theme={theme}
            agents={agentsWithColor}
            activeAgentId={activeAgentId}
            canWrite={canWrite}
            onSelect={handleSelectAgent}
            onEdit={goEditAgent}
            onDelete={handleDeleteAgent}
            onNew={() => goEditAgent(null)}
          />
        ) : tab === 'image-prompts' ? (
          <ImagePromptListScreen
            theme={theme}
            prompts={imagePrompts}
            canWrite={canWrite}
            onEdit={goEditImagePrompt}
            onDelete={handleDeleteImagePrompt}
            onNew={() => goEditImagePrompt(null)}
          />
        ) : (
          <StatsScreen theme={theme} chatId={chatId} />
        )}
      </div>

      <TabBar theme={theme} active={tab} onChange={goTab} />

      <BottomSheet isOpen={isEditView} onClose={closeModal} theme={theme} title={sheetTitle}>
        {isEditAgent && (
          <EditAgentScreen
            key={editingAgentId ?? 'new-agent'}
            theme={theme}
            agent={editingAgent}
            canWrite={canWrite}
            onBack={closeModal}
            onSave={handleSaveAgent}
            onDelete={handleDeleteAgent}
          />
        )}
        {isEditImagePrompt && (
          <EditImagePromptScreen
            key={editingImagePromptId ?? 'new-image-prompt'}
            theme={theme}
            prompt={editingImagePrompt}
            canWrite={canWrite}
            onBack={closeModal}
            onSave={handleSaveImagePrompt}
            onDelete={handleDeleteImagePrompt}
          />
        )}
      </BottomSheet>
    </div>
  )
}
