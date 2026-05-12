import { useEffect, useState } from 'react'
import { Theme } from '../../hooks/useTheme'

interface Props {
  isOpen: boolean
  onClose: () => void
  theme: Theme
  title: string
  children: React.ReactNode
}

export function BottomSheet({ isOpen, onClose, theme, title, children }: Props) {
  const [mounted, setMounted] = useState(isOpen)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) setMounted(true)
  }, [isOpen])

  useEffect(() => {
    if (!mounted) return
    if (isOpen) {
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
      return () => cancelAnimationFrame(raf)
    } else {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 360)
      return () => clearTimeout(t)
    }
  }, [isOpen, mounted])

  if (!mounted) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.52)',
          transition: 'opacity 280ms ease',
          opacity: visible ? 1 : 0,
        }}
      />

      <div style={{
        position: 'relative',
        background: theme.bg,
        borderRadius: '20px 20px 0 0',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 360ms cubic-bezier(0.32, 0.72, 0, 1)',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          width: 36, height: 5, borderRadius: 3,
          background: theme.divider,
          margin: '12px auto 0',
          flexShrink: 0,
        }} />

        <div style={{
          padding: '10px 20px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: `0.5px solid ${theme.divider}`,
          flexShrink: 0,
        }}>
          <div style={{
            flex: 1, fontSize: 17, fontWeight: 600,
            color: theme.text, letterSpacing: -0.3,
          }}>
            {title}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 15,
              background: theme.chip, border: 'none',
              cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 1l11 11M12 1L1 12" stroke={theme.textMuted} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
