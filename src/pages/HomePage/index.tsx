import { Theme } from '../../hooks/useTheme'
import styles from './HomePage.module.css'

interface Props {
  theme: Theme
  onNavigate: (page: string) => void
}

export function HomePage({ theme, onNavigate }: Props) {
  return (
    <div className={styles.page} style={{ background: theme.bg, color: theme.text }}>
      <button
        className={styles.navButton}
        style={{ background: theme.accent }}
        onClick={() => onNavigate('stats')}
      >
        Статистика
      </button>
    </div>
  )
}
