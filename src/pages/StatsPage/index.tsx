import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { CustomTooltip } from '../../components/CustomTooltip'
import { Theme } from '../../hooks/useTheme'
import { User } from '../../types'
import styles from './StatsPage.module.css'

interface Props {
  theme: Theme
  onBack: () => void
}

export function StatsPage({ theme, onBack }: Props) {
  const [users, setUsers] = useState<User[]>([])
  const [status, setStatus] = useState<'loading' | 'error' | 'empty' | 'ok'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const chatId = window.Telegram?.WebApp.initDataUnsafe.chat?.id?.toString()
      ?? new URLSearchParams(window.location.search).get('chatId')
      ?? import.meta.env.VITE_DEBUG_CHAT_ID
    if (!chatId) {
      setStatus('error')
      setErrorMsg('chatId не указан')
      return
    }

    const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''
    fetch(`${apiBase}/saturn-api/api/stats/monthly?chatId=${encodeURIComponent(chatId)}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<{ users: User[] }>
      })
      .then(data => {
        if (!data.users.length) {
          setStatus('empty')
        } else {
          setUsers(data.users)
          setStatus('ok')
        }
      })
      .catch(e => {
        setErrorMsg(String(e.message))
        setStatus('error')
      })
  }, [])

  const chartHeight = Math.max(users.length * 48 + 40, 100)

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

      <h1 className={styles.title}>Топ за месяц по сообщениям</h1>

      {status === 'loading' && <p style={{ color: theme.hint }}>Загрузка...</p>}
      {status === 'error' && <p style={{ color: theme.hint }}>{errorMsg}</p>}
      {status === 'empty' && <p style={{ color: theme.hint }}>Нет данных за этот месяц</p>}

      {status === 'ok' && (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={users} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }}>
            <XAxis
              type="number"
              tick={{ fill: theme.hint, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fill: theme.text, fontSize: 13 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip theme={theme} />}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Bar dataKey="count" fill={theme.accent} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
