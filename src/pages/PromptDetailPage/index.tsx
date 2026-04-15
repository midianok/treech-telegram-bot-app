import { useState } from 'react'
import { Theme } from '../../hooks/useTheme'
import { AiAgent } from '../../types'
import styles from './PromptDetailPage.module.css'

interface Props {
  theme: Theme
  agent: AiAgent | null
  onBack: () => void
}

export function PromptDetailPage({ theme, agent, onBack }: Props) {
  const [name, setName] = useState(agent?.name ?? '')
  const [prompt, setPrompt] = useState(agent?.prompt ?? '')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [applyStatus, setApplyStatus] = useState<'idle' | 'applying' | 'applied' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const isCreate = agent === null
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''

  const chatId = window.Telegram?.WebApp.initDataUnsafe.start_param
    ?? new URLSearchParams(window.location.search).get('chatId')
    ?? import.meta.env.VITE_DEBUG_CHAT_ID

  function handleSave() {
    setSaveStatus('saving')
    setErrorMsg('')

    const req = isCreate
      ? fetch(`${apiBase}/saturn-api/api/ai-agents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, prompt }),
        })
      : fetch(`${apiBase}/saturn-api/api/ai-agents/${agent.id}/prompt`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        })

    req
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        setSaveStatus('saved')
      })
      .catch(e => {
        setErrorMsg(String(e.message))
        setSaveStatus('error')
      })
  }

  function handleApply() {
    if (!chatId) {
      setErrorMsg('chatId не указан')
      setApplyStatus('error')
      return
    }
    setApplyStatus('applying')
    setErrorMsg('')
    fetch(`${apiBase}/saturn-api/api/chats/${encodeURIComponent(chatId)}/ai-agent`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: agent!.id }),
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        setApplyStatus('applied')
      })
      .catch(e => {
        setErrorMsg(String(e.message))
        setApplyStatus('error')
      })
  }

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

      <h1 className={styles.title}>{isCreate ? 'Новый промпт' : agent.name}</h1>

      {isCreate && (
        <input
          className={styles.input}
          style={{
            background: theme.bg,
            color: theme.text,
            borderColor: theme.hint,
          }}
          placeholder="Название"
          value={name}
          onChange={e => {
            setName(e.target.value)
            setSaveStatus('idle')
          }}
        />
      )}

      <textarea
        className={styles.textarea}
        style={{
          background: theme.bg,
          color: theme.text,
          borderColor: theme.hint,
        }}
        placeholder="Промпт"
        value={prompt}
        onChange={e => {
          setPrompt(e.target.value)
          setSaveStatus('idle')
        }}
        rows={12}
      />

      {errorMsg && <p className={styles.error} style={{ color: '#ca5f5f' }}>{errorMsg}</p>}

      <div className={styles.actions}>
        <button
          className={styles.button}
          style={{ background: theme.accent }}
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? 'Сохранение...' : saveStatus === 'saved' ? 'Сохранено ✓' : 'Сохранить'}
        </button>
        {!isCreate && (
          <button
            className={styles.button}
            style={{ background: theme.accent }}
            onClick={handleApply}
            disabled={applyStatus === 'applying'}
          >
            {applyStatus === 'applying' ? 'Применение...' : applyStatus === 'applied' ? 'Применено ✓' : 'Применить к чату'}
          </button>
        )}
      </div>
    </div>
  )
}
