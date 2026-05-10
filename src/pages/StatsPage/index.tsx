import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../api'
import { Theme } from '../../hooks/useTheme'
import { OperationCall, User } from '../../types'
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

interface AggregatedOp { name: string; count: number }

function aggregateOps(calls: OperationCall[]): { topOps: AggregatedOp[]; topUsers: AggregatedOp[] } {
  const ops: Record<string, number> = {}
  const users: Record<string, number> = {}
  for (const c of calls) {
    const op = (c.operationName ?? '—').replace(/Operation$/i, '')
    ops[op] = (ops[op] ?? 0) + 1
    const user = c.userName || String(c.userId)
    users[user] = (users[user] ?? 0) + 1
  }
  const sort = (map: Record<string, number>) =>
    Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  return { topOps: sort(ops).slice(0, 10), topUsers: sort(users).slice(0, 10) }
}

export function StatsScreen({ theme, chatId }: Props) {
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [weekly, setWeekly] = useState<User[]>([])
  const [monthly, setMonthly] = useState<User[]>([])
  const [weeklyOps, setWeeklyOps] = useState<OperationCall[]>([])
  const [monthlyOps, setMonthlyOps] = useState<OperationCall[]>([])
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!chatId) { setStatus('error'); setErrorMsg('chatId не указан'); return }

    const now = new Date().toISOString()
    const q = (dateFrom: string, extra?: Record<string, string>) =>
      new URLSearchParams({ chatId, dateFrom, dateTo: now, ...extra }).toString()

    Promise.all([
      apiFetch(`/api/stats/top-users?${q(getWeekStart(), { limit: '10' })}`).then(r => r.ok ? r.json() as Promise<User[]> : []),
      apiFetch(`/api/stats/top-users?${q(getMonthStart(), { limit: '10' })}`).then(r => r.ok ? r.json() as Promise<User[]> : []),
      apiFetch(`/api/stats/operation-calls?${q(getWeekStart())}`).then(r => r.ok ? r.json() as Promise<OperationCall[]> : []),
      apiFetch(`/api/stats/operation-calls?${q(getMonthStart())}`).then(r => r.ok ? r.json() as Promise<OperationCall[]> : []),
    ]).then(([w, m, wo, mo]) => {
      setWeekly(w)
      setMonthly(m)
      setWeeklyOps(wo)
      setMonthlyOps(mo)
      setStatus('ok')
    }).catch(e => {
      setErrorMsg(String(e.message))
      setStatus('error')
    })
  }, [chatId])

  const { topOps, topUsers: topOpUsers } = useMemo(
    () => aggregateOps(period === 'week' ? weeklyOps : monthlyOps),
    [period, weeklyOps, monthlyOps],
  )

  if (status === 'loading') {
    return <div style={{ padding: 20, color: theme.textMuted }}>Загрузка...</div>
  }
  if (status === 'error') {
    return <div style={{ padding: 20, color: theme.textMuted }}>{errorMsg}</div>
  }

  const data = period === 'week' ? weekly : monthly
  const max = Math.max(...data.map(u => u.count), 1)
  const total = data.reduce((s, u) => s + u.count, 0)

  const maxOps = Math.max(...topOps.map(o => o.count), 1)
  const maxOpUsers = Math.max(...topOpUsers.map(u => u.count), 1)

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

      {/* Top operations chart */}
      <div>
        <div style={{
          fontSize: 13, color: theme.textMuted, textTransform: 'uppercase',
          letterSpacing: 0.3, padding: '2px 4px 10px',
        }}>Топ операций</div>

        {topOps.length === 0 ? (
          <div style={{ fontSize: 14, color: theme.textMuted, padding: '0 4px' }}>Нет данных за этот период</div>
        ) : (
          <div style={{ background: theme.surface, borderRadius: 14, boxShadow: theme.shadow, overflow: 'hidden' }}>
            {topOps.map((op, i) => {
              const w = (op.count / maxOps) * 100
              const isLast = i === topOps.length - 1
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px',
                  borderBottom: isLast ? 'none' : `0.5px solid ${theme.divider}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 500, color: theme.text,
                        letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        fontFamily: 'monospace',
                      }}>{op.name}</div>
                      <div style={{
                        fontSize: 14, fontWeight: 600, color: theme.text,
                        fontVariantNumeric: 'tabular-nums', marginLeft: 10, flexShrink: 0,
                      }}>{op.count.toLocaleString('ru-RU')}</div>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: theme.chip, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${w}%`,
                        background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentDim})`,
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

      {/* Top users by operations */}
      <div>
        <div style={{
          fontSize: 13, color: theme.textMuted, textTransform: 'uppercase',
          letterSpacing: 0.3, padding: '2px 4px 10px',
        }}>Кто вызывает больше всего операций</div>

        {topOpUsers.length === 0 ? (
          <div style={{ fontSize: 14, color: theme.textMuted, padding: '0 4px' }}>Нет данных за этот период</div>
        ) : (
          <div style={{ background: theme.surface, borderRadius: 14, boxShadow: theme.shadow, overflow: 'hidden' }}>
            {topOpUsers.map((u, i) => {
              const w = (u.count / maxOpUsers) * 100
              const isLast = i === topOpUsers.length - 1
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
