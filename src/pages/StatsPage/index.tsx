import { useEffect, useState } from 'react'
import { apiFetch } from '../../api'
import { Theme } from '../../hooks/useTheme'
import { User } from '../../types'
import { Icon } from '../../components/ui'

interface Props {
  theme: Theme
  chatId: string | null
}

function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay() || 7
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day - 1)).toISOString()
}

function getMonthStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

export function StatsScreen({ theme, chatId }: Props) {
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [weekly, setWeekly] = useState<User[]>([])
  const [monthly, setMonthly] = useState<User[]>([])
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!chatId) { setStatus('error'); setErrorMsg('chatId не указан'); return }

    const now = new Date().toISOString()
    const q = (dateFrom: string) =>
      new URLSearchParams({ chatId, dateFrom, dateTo: now, limit: '10' }).toString()

    Promise.all([
      apiFetch(`/saturn-api/api/stats/top-users?${q(getWeekStart())}`).then(r => r.ok ? r.json() as Promise<User[]> : []),
      apiFetch(`/saturn-api/api/stats/top-users?${q(getMonthStart())}`).then(r => r.ok ? r.json() as Promise<User[]> : []),
    ]).then(([w, m]) => {
      setWeekly(w)
      setMonthly(m)
      setStatus('ok')
    }).catch(e => {
      setErrorMsg(String(e.message))
      setStatus('error')
    })
  }, [chatId])

  if (status === 'loading') {
    return <div style={{ padding: 20, color: theme.textMuted }}>Загрузка...</div>
  }
  if (status === 'error') {
    return <div style={{ padding: 20, color: theme.textMuted }}>{errorMsg}</div>
  }

  const data = period === 'week' ? weekly : monthly
  const max = Math.max(...data.map(u => u.count), 1)
  const total = data.reduce((s, u) => s + u.count, 0)

  return (
    <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Period toggle */}
      <div style={{ display: 'flex', background: theme.chip, borderRadius: 10, padding: 3, gap: 2 }}>
        {(['week', 'month'] as const).map(id => {
          const label = id === 'week' ? 'Неделя' : 'Месяц'
          const isActive = period === id
          return (
            <div key={id} onClick={() => setPeriod(id)} style={{
              flex: 1, padding: '9px 10px', textAlign: 'center', cursor: 'pointer',
              background: isActive ? theme.surface : 'transparent',
              color: isActive ? theme.text : theme.textMuted,
              fontSize: 14, fontWeight: 600, letterSpacing: -0.1, borderRadius: 8,
              boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              transition: 'background 0.15s',
            }}>{label}</div>
          )
        })}
      </div>

      {/* Summary card */}
      {data.length > 0 && (
        <div style={{ background: theme.surface, borderRadius: 14, padding: 18, boxShadow: theme.shadow }}>
          <div style={{ display: 'flex', gap: 20 }}>
            <SummaryStat theme={theme} value={total.toLocaleString('ru-RU')} label="всего сообщений" />
            <div style={{ width: 0.5, background: theme.divider }} />
            <SummaryStat theme={theme} value={String(data.length)} label="активных людей" />
            <div style={{ width: 0.5, background: theme.divider }} />
            <SummaryStat theme={theme} value={Math.round(total / data.length).toLocaleString('ru-RU')} label="среднее" />
          </div>
          <div style={{
            marginTop: 14, paddingTop: 12, borderTop: `0.5px solid ${theme.divider}`,
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: theme.textMuted,
          }}>
            <Icon name="calendar" size={14} color={theme.textMuted} strokeWidth={1.8} />
            {period === 'week' ? 'с понедельника' : 'с 1-го числа'}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div>
        <div style={{
          fontSize: 13, color: theme.textMuted, textTransform: 'uppercase',
          letterSpacing: 0.3, padding: '2px 4px 10px',
        }}>Топ участников</div>

        {data.length === 0 ? (
          <div style={{ fontSize: 14, color: theme.textMuted, padding: '0 4px' }}>Нет данных за этот период</div>
        ) : (
          <div style={{ background: theme.surface, borderRadius: 14, boxShadow: theme.shadow, overflow: 'hidden' }}>
            {data.map((u, i) => {
              const w = (u.count / max) * 100
              const isLast = i === data.length - 1
              const rankColors = ['#FACC15', '#C0C5D0', '#CD7F32']
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px',
                  borderBottom: isLast ? 'none' : `0.5px solid ${theme.divider}`,
                }}>
                  <div style={{
                    width: 24, textAlign: 'center',
                    fontSize: 15, fontWeight: 700,
                    color: i < 3 ? rankColors[i] : theme.textMuted,
                    fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3,
                  }}>{i + 1}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                      <div style={{
                        fontSize: 15, fontWeight: 500, color: theme.text,
                        letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{u.name}</div>
                      <div style={{
                        fontSize: 14, fontWeight: 600, color: theme.text,
                        fontVariantNumeric: 'tabular-nums', marginLeft: 10, flexShrink: 0,
                      }}>{u.count.toLocaleString('ru-RU')}</div>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: theme.chip, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${w}%`,
                        background: i < 3
                          ? `linear-gradient(90deg, ${theme.accent}, ${theme.accentDim})`
                          : theme.accent,
                        borderRadius: 3, transition: 'width 0.4s ease-out',
                      }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryStat({ theme, value, label }: { theme: Theme; value: string; label: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: theme.text, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2, lineHeight: 1.2 }}>{label}</div>
    </div>
  )
}
