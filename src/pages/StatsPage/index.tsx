import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { CustomTooltip } from '../../components/CustomTooltip'
import { Theme } from '../../hooks/useTheme'
import { User } from '../../types'
import styles from './StatsPage.module.css'

const COLORS = [
  '#5288c1', '#ca5f5f', '#5cb85c', '#f0ad4e',
  '#9b59b6', '#1abc9c', '#e67e22', '#e91e63',
  '#00bcd4', '#8bc34a',
]

interface Props {
  theme: Theme
  onBack: () => void
}

export function StatsPage({ theme, onBack }: Props) {
  const [users, setUsers] = useState<User[]>([])
  const [status, setStatus] = useState<'loading' | 'error' | 'empty' | 'ok'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const chatId = window.Telegram?.WebApp.initDataUnsafe.start_param
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
        <ResponsiveContainer width="100%" height={360}>
          <PieChart>
            <Pie
              data={users}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="45%"
              outerRadius={120}
              label={({ x, y, name, percent }) => {
                const pct = `${(percent * 100).toFixed(0)}%`
                if (percent < 0.05) {
                  return <text x={x} y={y} textAnchor="middle" fill={theme.text} fontSize={12}>{pct}</text>
                }
                return (
                  <text x={x} y={y} textAnchor="middle" fill={theme.text} fontSize={12}>
                    <tspan x={x} dy="-0.4em">{name}</tspan>
                    <tspan x={x} dy="1.2em">{pct}</tspan>
                  </text>
                )
              }}
              labelLine={false}
            >
              {users.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip theme={theme} />} />
            <Legend
              formatter={(value) => (
                <span style={{ color: theme.text, fontSize: 13 }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
