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
import { apiFetch } from '../../api'
import { Theme } from '../../hooks/useTheme'
import { User } from '../../types'
import styles from './StatsPage.module.css'

const COLORS = ['#2ea6ff', '#ffd60a', '#30d158', '#ff3b30', '#9b59b6', '#1abc9c', '#e67e22', '#e91e63', '#00bcd4', '#8bc34a']

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

    apiFetch(`/saturn-api/api/stats/monthly?chatId=${encodeURIComponent(chatId)}`)
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

  const totalMessages = users.reduce((sum, u) => sum + u.count, 0)
  const topUser = users.length > 0 ? users.reduce((a, b) => (a.count > b.count ? a : b)) : null

  return (
    <div className={styles.page} style={{ background: theme.bg, color: theme.text }}>
      <div className={styles.header} style={{ borderColor: theme.border }}>
        <button
          className={styles.backButton}
          style={{ color: theme.accent }}
          onClick={onBack}
        >
          ← Назад
        </button>
        <span className={styles.headerTitle}>Статистика</span>
        <span className={styles.headerSpacer} />
      </div>

      <div className={styles.body}>
        {status === 'loading' && <p style={{ color: theme.hint }}>Загрузка...</p>}
        {status === 'error' && <p style={{ color: theme.hint }}>{errorMsg}</p>}
        {status === 'empty' && <p style={{ color: theme.hint }}>Нет данных за этот месяц</p>}

        {status === 'ok' && (
          <>
            <div className={styles.metricsRow}>
              <div
                className={styles.metricCard}
                style={{ background: theme.surface, borderColor: theme.border }}
              >
                <span className={styles.metricNumber}>{totalMessages}</span>
                <span className={styles.metricLabel} style={{ color: theme.secondary }}>
                  Сообщений
                </span>
              </div>
              <div
                className={styles.metricCard}
                style={{ background: theme.surface, borderColor: theme.border }}
              >
                <span className={styles.metricNumber}>{users.length}</span>
                <span className={styles.metricLabel} style={{ color: theme.secondary }}>
                  Участников
                </span>
              </div>
            </div>

            {topUser && (
              <div
                className={styles.metricCardFull}
                style={{ background: theme.surface, borderColor: theme.border }}
              >
                <span className={styles.metricNumber}>{topUser.name}</span>
                <span className={styles.metricLabel} style={{ color: theme.secondary }}>
                  Самый активный · {topUser.count} сообщений
                </span>
              </div>
            )}

            <div
              className={styles.chartCard}
              style={{ background: theme.surface, borderColor: theme.border }}
            >
              <p className={styles.chartTitle} style={{ color: theme.secondary }}>
                Топ за месяц по сообщениям
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={users}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={110}
                    innerRadius={50}
                    label={({ x, y, percent }) => {
                      const pct = `${(percent * 100).toFixed(0)}%`
                      if (percent < 0.05) return null
                      return (
                        <text x={x} y={y} textAnchor="middle" fill={theme.text} fontSize={12}>
                          {pct}
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
            </div>
          </>
        )}
      </div>
    </div>
  )
}
