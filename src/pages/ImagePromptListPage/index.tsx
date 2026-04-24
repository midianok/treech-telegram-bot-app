import { Theme } from '../../hooks/useTheme'
import { ImagePrompt } from '../../types'
import { Icon } from '../../components/ui'

interface Props {
  theme: Theme
  prompts: ImagePrompt[]
  canWrite: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onNew: () => void
}

export function ImagePromptListScreen({ theme, prompts, canWrite, onEdit, onDelete, onNew }: Props) {
  return (
    <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        background: `${theme.accent}12`, border: `1px solid ${theme.accent}22`,
        borderRadius: 12, padding: '12px 14px',
        fontSize: 13, color: theme.textMuted, lineHeight: 1.4,
      }}>
        Промпты для генерации изображений. Используются в командах бота.
      </div>

      {prompts.length === 0 && (
        <div style={{ fontSize: 14, color: theme.textMuted, padding: '8px 4px' }}>Нет промптов</div>
      )}

      {prompts.map(p => (
        <div key={p.id} style={{
          background: theme.surface, borderRadius: 14,
          border: `1.5px solid transparent`,
          padding: 16, boxShadow: theme.shadow,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: theme.text, letterSpacing: -0.2 }}>
                {p.name}
              </div>
              {p.keywords && (
                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {p.keywords.split(',').map(kw => kw.trim()).filter(Boolean).map((kw, i) => (
                    <span key={i} style={{
                      fontSize: 11, fontWeight: 500,
                      background: `${theme.accent}18`, color: theme.accent,
                      padding: '2px 8px', borderRadius: 6,
                    }}>{kw}</span>
                  ))}
                </div>
              )}
              <div style={{
                fontSize: 13, color: theme.textMuted, marginTop: 6, lineHeight: 1.45,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>{p.prompt}</div>
            </div>
          </div>

          {canWrite && (
            <div style={{
              marginTop: 12, paddingTop: 12,
              borderTop: `0.5px solid ${theme.divider}`,
              display: 'flex', gap: 8, justifyContent: 'flex-end',
            }}>
              <button onClick={() => onEdit(p.id)} style={{
                width: 40, height: 36, padding: 0, borderRadius: 9,
                background: 'transparent', border: `1px solid ${theme.divider}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <Icon name="edit" size={16} color={theme.accent} />
              </button>
              <button onClick={() => onDelete(p.id)} style={{
                width: 40, height: 36, padding: 0, borderRadius: 9,
                background: 'transparent', border: `1px solid ${theme.divider}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <Icon name="trash" size={16} color="#E55555" />
              </button>
            </div>
          )}
        </div>
      ))}

      {canWrite && (
        <button onClick={onNew} style={{
          background: 'transparent', border: `1.5px dashed ${theme.divider}`,
          borderRadius: 14, padding: '16px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          color: theme.accent, fontSize: 15, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', marginTop: 4,
        }}>
          <Icon name="plus" size={18} color={theme.accent} /> Добавить промпт
        </button>
      )}
    </div>
  )
}
