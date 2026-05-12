import { Theme } from '../../hooks/useTheme'
import { AiAgent } from '../../types'
import { Avatar, Icon } from '../../components/ui'

interface Props {
  theme: Theme
  agents: AiAgent[]
  activeAgentId: string | null
  canWrite: boolean
  onSelect: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onNew: () => void
}

export function AgentsScreen({ theme, agents, activeAgentId, canWrite, onSelect, onEdit, onDelete, onNew }: Props) {
  return (
    <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {agents.length === 0 && (
        <div style={{ fontSize: 14, color: theme.textMuted, padding: '8px 4px' }}>Нет агентов</div>
      )}

      {agents.map(a => {
        const isActive = a.id === activeAgentId
        return (
          <div key={a.id} style={{
            background: theme.surface, borderRadius: 14,
            border: isActive ? `1.5px solid ${theme.accent}` : `1.5px solid transparent`,
            padding: 16, boxShadow: theme.shadow,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Avatar name={a.name} color={a.color} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: theme.text, letterSpacing: -0.2 }}>{a.name}</div>
                  {isActive && (
                    <div style={{
                      fontSize: 10, fontWeight: 600, color: '#fff',
                      background: theme.accent, padding: '2px 7px', borderRadius: 6, letterSpacing: 0.3,
                    }}>АКТИВЕН</div>
                  )}
                </div>
                <div style={{
                  fontSize: 13, color: theme.textMuted, marginTop: 4, lineHeight: 1.45,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{a.prompt}</div>
              </div>
            </div>

            {canWrite && (
              <div style={{
                marginTop: 12, paddingTop: 12,
                borderTop: `0.5px solid ${theme.divider}`,
                display: 'flex', gap: 8,
              }}>
                {!isActive ? (
                  <button onClick={() => onSelect(a.id)} style={{
                    flex: 2, padding: '9px 12px', borderRadius: 9,
                    background: theme.accent, color: '#fff', border: 'none',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}>Выбрать</button>
                ) : (
                  <div style={{
                    flex: 2, padding: '9px 12px', borderRadius: 9,
                    background: theme.chip, color: theme.textMuted,
                    fontSize: 14, fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <Icon name="check" size={14} color={theme.success} /> Используется
                  </div>
                )}
                <button onClick={() => onEdit(a.id)} style={{
                  width: 40, height: 36, padding: 0, borderRadius: 9,
                  background: 'transparent', border: `1px solid ${theme.divider}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  <Icon name="edit" size={16} color={theme.accent} />
                </button>
                <button onClick={() => onDelete(a.id)} style={{
                  width: 40, height: 36, padding: 0, borderRadius: 9,
                  background: 'transparent', border: `1px solid ${theme.divider}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  <Icon name="trash" size={16} color="#E55555" />
                </button>
              </div>
            )}
          </div>
        )
      })}

      {canWrite && (
        <button onClick={onNew} style={{
          background: 'transparent', border: `1.5px dashed ${theme.divider}`,
          borderRadius: 14, padding: '16px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          color: theme.accent, fontSize: 15, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', marginTop: 4,
        }}>
          <Icon name="plus" size={18} color={theme.accent} /> Создать нового агента
        </button>
      )}
    </div>
  )
}
