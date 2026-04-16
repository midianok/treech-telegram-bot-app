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
        className={styles.menuButton}
        style={{ background: theme.surface, borderColor: theme.border }}
        onClick={() => onNavigate('stats')}
      >
        <div className={styles.iconWrap} style={{ background: '#ffd60a20' }}>
          <span className={styles.icon}>📊</span>
        </div>
        <div className={styles.textBlock}>
          <span className={styles.buttonTitle}>Статистика</span>
          <span className={styles.buttonSubtitle} style={{ color: theme.secondary }}>
            Активность за месяц
          </span>
        </div>
        <span className={styles.chevron}>›</span>
      </button>

      {canSeePrompts && (
        <button
          className={styles.menuButton}
          style={{ background: theme.surface, borderColor: theme.border }}
          onClick={() => onNavigate('prompts')}
        >
          <div className={styles.iconWrap} style={{ background: '#2ea6ff20' }}>
            <span className={styles.icon}>✏️</span>
          </div>
          <div className={styles.textBlock}>
            <span className={styles.buttonTitle}>Промпты</span>
            <span className={styles.buttonSubtitle} style={{ color: theme.secondary }}>
              Управление промптами
            </span>
          </div>
          <span className={styles.chevron}>›</span>
        </button>
      )}
    </div>
  )
}
