import { useEffect, useState } from 'react'
import { apiFetch } from '../../api'
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
    const chatId = window.Telegram?.WebApp.initDataUnsafe.start_param
      ?? new URLSearchParams(window.location.search).get('chatId')
      ?? import.meta.env.VITE_DEBUG_CHAT_ID

    const agentsReq = apiFetch('/saturn-api/api/ai-agents')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<AiAgent[]>
      })

    const activeReq = chatId
      ? apiFetch(`/saturn-api/api/chats/${encodeURIComponent(chatId)}/ai-agent`)
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
      <div className={styles.header} style={{ borderColor: theme.border }}>
        <button className={styles.backButton} style={{ color: theme.accent }} onClick={onBack}>
          ← Назад
        </button>
        <span className={styles.headerTitle}>Промпты</span>
        <button className={styles.createButton} style={{ color: theme.accent }} onClick={onCreate}>
          + Создать
        </button>
      </div>

      <div className={styles.body}>
        {status === 'loading' && <p style={{ color: theme.hint }}>Загрузка...</p>}
        {status === 'error' && <p style={{ color: theme.hint }}>{errorMsg}</p>}
        {status === 'empty' && <p style={{ color: theme.hint }}>Нет промптов</p>}

        {status === 'ok' && (
          <>
            <p className={styles.sectionLabel} style={{ color: theme.secondary }}>
              Все промпты — {agents.length}
            </p>
            <ul className={styles.list}>
              {agents.map(agent => {
                const isActive = agent.id === activeAgentId
                return (
                  <li key={agent.id}>
                    <button
                      className={styles.item}
                      style={{ background: theme.surface, borderColor: theme.border }}
                      onClick={() => onSelect(agent)}
                    >
                      <div className={styles.itemTop}>
                        <span className={styles.itemName}>{agent.name}</span>
                        <span
                          className={styles.statusPill}
                          style={
                            isActive
                              ? { background: '#2ea6ff', color: '#ffffff' }
                              : { background: '#e5e5ea', color: '#6e6e73' }
                          }
                        >
                          {isActive ? 'активен' : 'неактивен'}
                        </span>
                      </div>
                      <p className={styles.itemPreview} style={{ color: theme.secondary }}>
                        {agent.prompt}
                      </p>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
