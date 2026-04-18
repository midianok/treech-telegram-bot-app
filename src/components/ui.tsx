import { Theme } from '../hooks/useTheme'

export function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 2 }: {
  name: string; size?: number; color?: string; strokeWidth?: number
}) {
  const p = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'sparkle': return <svg {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="M19 3l.6 1.7L21 5l-1.4.6L19 7l-.6-1.4L17 5l1.4-.6L19 3z"/></svg>
    case 'chart': return <svg {...p}><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>
    case 'plus': return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>
    case 'check': return <svg {...p}><path d="M5 12l5 5L20 6"/></svg>
    case 'back': return <svg {...p}><path d="M15 6l-6 6 6 6"/></svg>
    case 'edit': return <svg {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
    case 'trash': return <svg {...p}><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14"/></svg>
    case 'calendar': return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
    case 'home': return <svg {...p}><path d="M3 11l9-8 9 8v10a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2V11z"/></svg>
    default: return null
  }
}

export function Avatar({ name, color, size = 40 }: { name: string; color?: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: color || '#2AABEE',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 600, fontSize: size * 0.38,
      letterSpacing: 0.3, flexShrink: 0,
    }}>{initials}</div>
  )
}

export type Tab = 'home' | 'agents' | 'stats'

export function TopBar({ theme, title, subtitle, leading, trailing }: {
  theme: Theme; title: string; subtitle?: string
  leading?: React.ReactNode; trailing?: React.ReactNode
}) {
  return (
    <div style={{
      padding: '14px 20px 12px',
      display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: `0.5px solid ${theme.divider}`,
      background: theme.bg, flexShrink: 0,
    }}>
      {leading}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: theme.text, letterSpacing: -0.3 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 1 }}>{subtitle}</div>}
      </div>
      {trailing}
    </div>
  )
}

export function TabBar({ theme, active, onChange }: {
  theme: Theme; active: Tab; onChange: (tab: Tab) => void
}) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'home', label: 'Главная', icon: 'home' },
    { id: 'agents', label: 'Агенты', icon: 'sparkle' },
    { id: 'stats', label: 'Статистика', icon: 'chart' },
  ]
  return (
    <div style={{
      background: theme.tabBarBg,
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderTop: `0.5px solid ${theme.tabBarBorder}`,
      paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      paddingTop: 8,
      display: 'flex', flexShrink: 0,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id
        return (
          <div key={t.id} onClick={() => onChange(t.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3, cursor: 'pointer',
            color: isActive ? theme.accent : theme.textMuted, paddingBottom: 4,
          }}>
            <Icon name={t.icon} size={24} color={isActive ? theme.accent : theme.textMuted}
              strokeWidth={isActive ? 2.2 : 1.8} />
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: 0.1 }}>{t.label}</div>
          </div>
        )
      })}
    </div>
  )
}
