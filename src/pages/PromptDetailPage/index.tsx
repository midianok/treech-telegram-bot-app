import { useState } from 'react'
import { Theme } from '../../hooks/useTheme'
import { AiAgent } from '../../types'

interface Props {
  theme: Theme
  agent: AiAgent | null
  canWrite: boolean
  onBack: () => void
  onSave: (id: string | null | undefined, name: string, prompt: string) => void
  onDelete: (id: string) => void
}

export function EditAgentScreen({ theme, agent, canWrite, onBack, onSave, onDelete }: Props) {
  const isNew = !agent
  const [name, setName] = useState(agent?.name || '')
  const [prompt, setPrompt] = useState(agent?.prompt || '')
  const [deleteStep, setDeleteStep] = useState<0 | 1>(0)

  const canSave = canWrite && name.trim().length > 0 && prompt.trim().length > 10

  const handleDelete = () => {
    if (deleteStep === 0) {
      setDeleteStep(1)
      setTimeout(() => setDeleteStep(0), 3000)
    } else {
      onDelete(agent!.id)
    }
  }

  return (
    <div style={{ padding: '20px 20px 140px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <FieldLabel theme={theme}>Имя агента</FieldLabel>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="например, Саркастик"
          readOnly={!canWrite}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: theme.surface, color: theme.text,
            border: 'none', borderRadius: 12,
            padding: '14px 16px', fontSize: 17,
            fontFamily: 'inherit', outline: 'none',
            boxShadow: theme.shadow,
          }}
        />
        <FieldHint theme={theme}>Отображается в списке и в шапке чата с ботом.</FieldHint>
      </div>

      <div>
        <FieldLabel theme={theme}>Системный промпт</FieldLabel>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Ты — ..."
          rows={10}
          readOnly={!canWrite}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: theme.surface, color: theme.text,
            border: 'none', borderRadius: 12,
            padding: '14px 16px', fontSize: 15, lineHeight: 1.5,
            fontFamily: 'inherit', outline: 'none', resize: 'none',
            boxShadow: theme.shadow, minHeight: 200,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 4px 0' }}>
          <div style={{ fontSize: 12, color: theme.textMuted }}>Минимум 10 символов</div>
          <div style={{ fontSize: 12, color: theme.textMuted, fontVariantNumeric: 'tabular-nums' }}>{prompt.length}</div>
        </div>
      </div>

      {canWrite && (
        <div style={{
          background: `${theme.accent}0F`, borderRadius: 12, padding: '14px 16px',
          fontSize: 13, color: theme.textMuted, lineHeight: 1.5,
        }}>
          <div style={{ fontWeight: 600, color: theme.text, marginBottom: 6, fontSize: 13 }}>Советы</div>
          • Начинайте с «Ты — ...» и задавайте роль<br />
          • Указывайте длину и тон ответов<br />
          • Ограничения пишите явно: «никогда не ...»
        </div>
      )}

      {canWrite && !isNew && (
        <button onClick={handleDelete} style={{
          background: 'transparent', border: 'none',
          color: deleteStep === 1 ? '#FF3B30' : theme.textMuted,
          fontSize: 15, fontWeight: deleteStep === 1 ? 600 : 500,
          padding: '10px 0', cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {deleteStep === 1 ? 'Нажмите ещё раз для удаления' : 'Удалить агента'}
        </button>
      )}

      {/* Sticky save bar — only for write-enabled users */}
      {canWrite && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '12px 16px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          background: theme.tabBarBg,
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderTop: `0.5px solid ${theme.tabBarBorder}`,
          display: 'flex', gap: 10, zIndex: 40,
        }}>
          <button onClick={onBack} style={{
            flex: 1, padding: '14px', borderRadius: 12,
            background: theme.chip, color: theme.text, border: 'none',
            fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
          }}>Отмена</button>
          <button
            onClick={() => canSave && onSave(agent?.id, name.trim(), prompt.trim())}
            disabled={!canSave}
            style={{
              flex: 2, padding: '14px', borderRadius: 12,
              background: canSave ? theme.accent : theme.chip,
              color: canSave ? '#fff' : theme.textMuted,
              border: 'none', fontSize: 16, fontWeight: 600,
              cursor: canSave ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
            }}
          >
            {isNew ? 'Создать агента' : 'Сохранить'}
          </button>
        </div>
      )}
    </div>
  )
}

function FieldLabel({ theme, children }: { theme: Theme; children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 12, color: theme.textMuted,
      textTransform: 'uppercase', letterSpacing: 0.4,
      padding: '0 4px 8px', fontWeight: 500,
    }}>{children}</div>
  )
}

function FieldHint({ theme, children }: { theme: Theme; children: React.ReactNode }) {
  return <div style={{ fontSize: 12, color: theme.textDim, padding: '6px 4px 0', lineHeight: 1.4 }}>{children}</div>
}
