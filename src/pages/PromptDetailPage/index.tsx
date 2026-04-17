import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../../api'
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
  const [deleteStep, setDeleteStep] = useState<0 | 1>(0)
  const [errorMsg, setErrorMsg] = useState('')
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isCreate = agent === null

  const chatId = window.Telegram?.WebApp.initDataUnsafe.start_param
    ?? new URLSearchParams(window.location.search).get('chatId')
    ?? import.meta.env.VITE_DEBUG_CHAT_ID

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
      setDeleteStep(0)
    }
  }, [])

  function handleSave() {
    setSaveStatus('saving')
    setErrorMsg('')

    const req = isCreate
      ? apiFetch('/saturn-api/api/ai-agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, prompt }),
        })
      : apiFetch(`/saturn-api/api/ai-agents/${agent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, prompt }),
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

  function handleDelete() {
    if (deleteStep === 0) {
      setDeleteStep(1)
      deleteTimerRef.current = setTimeout(() => {
        setDeleteStep(0)
      }, 3000)
    } else {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
      setDeleteStep(0)
      setErrorMsg('')
      apiFetch(`/saturn-api/api/ai-agents/${agent!.id}`, { method: 'DELETE' })
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          onBack()
        })
        .catch(e => {
          setErrorMsg(String(e.message))
        })
    }
  }

  function handleApply() {
    if (!chatId) {
      setErrorMsg('chatId не указан')
      setApplyStatus('error')
      return
    }
    setApplyStatus('applying')
    setErrorMsg('')
    apiFetch(`/saturn-api/api/chats/${encodeURIComponent(chatId)}/ai-agent`, {
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
      <div className={styles.header} style={{ borderColor: theme.border }}>
        <button
          className={styles.backButton}
          style={{ color: theme.accent }}
          onClick={() => {
            if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
            setDeleteStep(0)
            onBack()
          }}
        >
          ← Назад
        </button>
        <span className={styles.headerTitle}>Редактор</span>
        <button
          className={styles.saveHeaderButton}
          style={{ color: theme.accent }}
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? 'Сохр...' : saveStatus === 'saved' ? 'Сохранено ✓' : 'Сохранить'}
        </button>
      </div>

      <div className={styles.body}>
        <p className={styles.fieldLabel} style={{ color: theme.secondary }}>Название</p>
        <div
          className={styles.fieldCard}
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <input
            className={styles.fieldInput}
            style={{ color: theme.text }}
            placeholder="Название промпта"
            value={name}
            onChange={e => {
              setName(e.target.value)
              setSaveStatus('idle')
            }}
          />
        </div>

        <p className={styles.fieldLabel} style={{ color: theme.secondary }}>Промпт</p>
        <div
          className={styles.fieldCard}
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <textarea
            className={styles.fieldTextarea}
            style={{ color: theme.text }}
            placeholder="Введите текст промпта"
            value={prompt}
            onChange={e => {
              setPrompt(e.target.value)
              setSaveStatus('idle')
            }}
            rows={10}
          />
        </div>

        {!isCreate && (
          <>
            <p className={styles.fieldLabel} style={{ color: theme.secondary }}>Применить к чату</p>
            <button
              className={styles.applyButton}
              style={{ background: theme.surface, borderColor: theme.border, color: theme.accent }}
              onClick={handleApply}
              disabled={applyStatus === 'applying'}
            >
              {applyStatus === 'applying' ? 'Применение...' : applyStatus === 'applied' ? 'Применено ✓' : 'Применить к чату'}
            </button>
          </>
        )}

        {errorMsg && (
          <p className={styles.error} style={{ color: '#ff3b30' }}>{errorMsg}</p>
        )}

        <button
          className={styles.saveButton}
          style={{ background: theme.accent }}
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? 'Сохранение...' : saveStatus === 'saved' ? 'Сохранено ✓' : 'Сохранить'}
        </button>

        {!isCreate && (
          <button
            className={styles.deleteButton}
            style={
              deleteStep === 1
                ? { background: '#ff3b30', borderColor: '#ff3b30', color: '#ffffff' }
                : { background: 'transparent', borderColor: '#ff3b30', color: '#ff3b30' }
            }
            onClick={handleDelete}
          >
            {deleteStep === 1 ? 'Нажмите ещё раз для удаления' : 'Удалить промпт'}
          </button>
        )}
      </div>
    </div>
  )
}
