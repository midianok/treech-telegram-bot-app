import { TooltipProps } from 'recharts'
import { Theme } from '../../hooks/useTheme'
import styles from './CustomTooltip.module.css'

interface Props extends TooltipProps<number, string> {
  theme: Theme
}

export function CustomTooltip({ active, payload, theme }: Props) {
  if (!active || !payload?.length) return null
  return (
    <div
      className={styles.tooltip}
      style={{
        background: theme.bg,
        border: `1px solid ${theme.hint}`,
        color: theme.text,
      }}
    >
      {payload[0].value} сообщ.
    </div>
  )
}