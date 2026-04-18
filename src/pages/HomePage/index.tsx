import { useEffect, useState } from 'react'
import { apiFetch } from '../../api'
import { Theme } from '../../hooks/useTheme'
import { AiAgent } from '../../types'
import { Avatar, Icon } from '../../components/ui'

interface Props {
  theme: Theme
  chatTitle: string
  agents: AiAgent[]
  activeAgentId: string | null
  chatId: string | null
  canWrite: boolean
  onGoAgents: () => void
  onGoStats: () => void
  onGoEdit: (id: string) => void
  onGoNew: () => void
}

export function HomeScreen({
  theme, chatTitle, agents, activeAgentId, chatId, canWrite,
  onGoAgents, onGoStats, onGoEdit, onGoNew,
}: Props) {
  const [todayCount, setTodayCount] = useState<number | null>(null)
  const activeAgent = agents.find(a => a.id === activeAgentId)

  useEffect(() => {
    if (!chatId) return
    const todayStart = new Date(
      new Date().getFullYear(), new Date().getMonth(), new Date().getDate()
    ).toISOString()
    apiFetch(`/saturn-api/api/stats/message-count?chatId=${encodeURIComponent(chatId)}&dateFrom=${encodeURIComponent(todayStart)}`)
      .then(r => r.ok ? r.json() as Promise<{ count: number }> : null)
      .then(d => { if (d) setTodayCount(d.count) })
      .catch(() => {})
  }, [chatId])

  return (
    <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Chat card */}
      <div style={{ background: theme.surface, borderRadius: 14, boxShadow: theme.shadow, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 26, flexShrink: 0,
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDim})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 22, fontWeight: 600,
          }}>{(chatTitle[0] ?? 'T').toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 600, color: theme.text, letterSpacing: -0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {chatTitle}
            </div>
            <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>активно</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 16, borderTop: `0.5px solid ${theme.divider}` }}>
          <StatItem theme={theme} value={todayCount !== null ? todayCount.toLocaleString('ru-RU') : '—'} label="сообщений сегодня" />
          <div style={{ width: 0.5, background: theme.divider }} />
          <StatItem theme={theme} value={String(agents.length)} label="агентов доступно" />
        </div>
      </div>

      {/* Active agent */}
      <div>
        <div style={{ fontSize: 13, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.3, padding: '2px 4px 8px' }}>
          Активный агент
        </div>
        {activeAgent ? (
          <div style={{ background: theme.surface, borderRadius: 14, boxShadow: theme.shadow, padding: 18, cursor: 'pointer' }}
            onClick={onGoAgents}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Avatar name={activeAgent.name} color={activeAgent.color} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: theme.text, letterSpacing: -0.2 }}>{activeAgent.name}</div>
                  <div style={{
                    fontSize: 11, fontWeight: 500, color: theme.success,
                    background: `${theme.success}22`, padding: '2px 7px', borderRadius: 6, letterSpacing: 0.2,
                  }}>ВКЛ</div>
                </div>
                <div style={{
                  fontSize: 14, color: theme.textMuted, marginTop: 5, lineHeight: 1.4,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{activeAgent.prompt}</div>
              </div>
            </div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `0.5px solid ${theme.divider}`, display: 'flex', gap: 8 }}>
              {canWrite ? (
                <>
                  <div onClick={e => { e.stopPropagation(); onGoAgents() }} style={miniBtn(theme, false)}>Сменить</div>
                  <div onClick={e => { e.stopPropagation(); onGoEdit(activeAgent.id) }} style={miniBtn(theme, true)}>
                    <Icon name="edit" size={14} color={theme.accent} /> Править промпт
                  </div>
                </>
              ) : (
                <div style={miniBtn(theme, false)}>Смотреть агентов</div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: theme.surface, borderRadius: 14, boxShadow: theme.shadow, padding: 18, cursor: 'pointer' }}
            onClick={onGoAgents}>
            <div style={{ fontSize: 14, color: theme.textMuted }}>Агент не выбран. Нажмите, чтобы выбрать.</div>
          </div>
        )}
      </div>

      {/* Quick tiles */}
      <div>
        <div style={{ fontSize: 13, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.3, padding: '2px 4px 8px' }}>
          Быстрый переход
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <QuickTile theme={theme} icon="sparkle" label="Все агенты" sublabel={`${agents.length} профилей`} onClick={onGoAgents} />
          <QuickTile theme={theme} icon="chart" label="Статистика" sublabel="топ участников" onClick={onGoStats} />
          {canWrite && (
            <QuickTile theme={theme} icon="plus" label="Новый агент" sublabel="с нуля" onClick={onGoNew} />
          )}
        </div>
      </div>
    </div>
  )
}

function StatItem({ theme, value, label }: { theme: Theme; value: string; label: string }) {
  return (
    <div style={{ flex: 1, padding: '2px 4px' }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: theme.text, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4 }}>{value}</div>
      <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2, lineHeight: 1.3 }}>{label}</div>
    </div>
  )
}

function QuickTile({ theme, icon, label, sublabel, onClick }: {
  theme: Theme; icon: string; label: string; sublabel: string; onClick: () => void
}) {
  return (
    <div onClick={onClick} style={{
      background: theme.surface, borderRadius: 14, padding: 16, cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: 10, boxShadow: theme.shadow, minHeight: 96,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, background: `${theme.accent}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={18} color={theme.accent} strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, letterSpacing: -0.2 }}>{label}</div>
        <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 1 }}>{sublabel}</div>
      </div>
    </div>
  )
}

function miniBtn(theme: Theme, outline: boolean): React.CSSProperties {
  return {
    flex: 1, padding: '9px 12px', borderRadius: 9,
    background: outline ? 'transparent' : theme.chip,
    border: outline ? `1px solid ${theme.divider}` : 'none',
    textAlign: 'center',
    fontSize: 14, fontWeight: 500,
    color: outline ? theme.accent : theme.text,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  }
}
