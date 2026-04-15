import { Theme } from '../../hooks/useTheme'
import styles from './HomePage.module.css'

const PROMPTS_ALLOWED_USERS = ['qwrzlp', 'ilya_naprimer']

interface Props {
  theme: Theme
  onNavigate: (page: string) => void
}

export function HomePage({ theme, onNavigate }: Props) {
  const username = window.Telegram?.WebApp?.initDataUnsafe?.user?.username ?? ''
  const canSeePrompts = import.meta.env.DEV || PROMPTS_ALLOWED_USERS.includes(username)

  return (
    <div className={styles.page} style={{ background: theme.bg, color: theme.text }}>
      <button
        className={styles.navButton}
        style={{ background: theme.accent }}
        onClick={() => onNavigate('stats')}
      >
        Статистика
      </button>
      {canSeePrompts && (
        <button
          className={styles.navButton}
          style={{ background: theme.accent }}
          onClick={() => onNavigate('prompts')}
        >
          Промпты
        </button>
      )}
    </div>
  )
}
