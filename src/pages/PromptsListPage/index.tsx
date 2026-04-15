import { useEffect, useState } from 'react'
import { Theme } from '../../hooks/useTheme'
import { AiAgent } from '../../types'
import styles from './PromptsListPage.module.css'

interface Props {
  theme: Theme
  onBack: () => void
  onSelect: (agent: AiAgent) => void
  onCreate: () => void
}

export function PromptsListPage({ theme, onBack, onSelect, onCreate }: Props) {
  const [agents, setAgents] = useState<AiAgent[]>([])
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'error' | 'empty' | 'ok'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''
    const chatId = window.Telegram?.WebApp.initDataUnsafe.start_param
      ?? new URLSearchParams(window.location.search).get('chatId')
      ?? import.meta.env.VITE_DEBUG_CHAT_ID

    const agentsReq = fetch(`${apiBase}/saturn-api/api/ai-agents`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<AiAgent[]>
      })

    const activeReq = chatId
      ? fetch(`${apiBase}/saturn-api/api/chats/${encodeURIComponent(chatId)}/ai-agent`)
          .then(r => (r.ok ? r.json() as Promise<{ id: string }> : null))
          .catch(() => null)
      : Promise.resolve(null)

    Promise.all([agentsReq, activeReq])
      .then(([data, active]) => {
        if (active?.id) setActiveAgentId(active.id)
        if (!data.length) {
          setStatus('empty')
        } else {
          setAgents(data)
          setStatus('ok')
        }
      })
      .catch(e => {
        setErrorMsg(String(e.message))
        setStatus('error')
      })
  }, [])

  return (
    <div className={styles.page} style={{ background: theme.bg, color: theme.text }}>
      <div className={styles.header}>
        <button
          className={styles.backButton}
          style={{ color: theme.accent }}
          onClick={onBack}
        >
          ← Назад
        </button>
      </div>

      <div className={styles.titleRow}>
        <h1 className={styles.title}>Промпты</h1>
        <button
          className={styles.createButton}
          style={{ background: theme.accent }}
          onClick={onCreate}
        >
          + Создать
        </button>
      </div>

      {status === 'loading' && <p style={{ color: theme.hint }}>Загрузка...</p>}
      {status === 'error' && <p style={{ color: theme.hint }}>{errorMsg}</p>}
      {status === 'empty' && <p style={{ color: theme.hint }}>Нет промптов</p>}

      {status === 'ok' && (
        <ul className={styles.list}>
          {agents.map(agent => {
            const isActive = agent.id === activeAgentId
            return (
              <li key={agent.id}>
                <button
                  className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
                  style={{ background: theme.accent }}
                  onClick={() => onSelect(agent)}
                >
                  <span>{agent.name}</span>
                  {isActive && <span className={styles.activeBadge}>✓ активен</span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
