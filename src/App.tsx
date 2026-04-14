import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'

interface User {
  name: string
  count: number
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        colorScheme: 'light' | 'dark'
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          button_color?: string
        }
        initDataUnsafe: {
          start_param?: string
        }
      }
    }
  }
}

function useTheme() {
  const tg = window.Telegram?.WebApp
  const p = tg?.themeParams ?? {}
  const dark = tg?.colorScheme === 'dark'
  return {
    bg: p.bg_color ?? (dark ? '#1c1c1e' : '#f2f2f7'),
    text: p.text_color ?? (dark ? '#ffffff' : '#000000'),
    hint: p.hint_color ?? '#8e8e93',
    accent: p.button_color ?? '#2ea6ff',
  }
}

function CustomTooltip({ active, payload, theme }: TooltipProps<number, string> & { theme: ReturnType<typeof useTheme> }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: theme.bg,
      border: `1px solid ${theme.hint}`,
      borderRadius: 8,
      padding: '6px 12px',
      color: theme.text,
      fontSize: 13,
    }}>
      {payload[0].value} сообщ.
    </div>
  )
}

export default function App() {
  const [users, setUsers] = useState<User[]>([])
  const [status, setStatus] = useState<'loading' | 'error' | 'empty' | 'ok'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const theme = useTheme()

  useEffect(() => {
    window.Telegram?.WebApp.ready()

    const startParam = window.Telegram?.WebApp.initDataUnsafe.start_param
    const chatId = startParam?.replace('chatId_', '')
      ?? new URLSearchParams(window.location.search).get('chatId')
      ?? import.meta.env.VITE_DEBUG_CHAT_ID
    if (!chatId) {
      setStatus('error')
      setErrorMsg('chatId не указан')
      return
    }

    const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''
    fetch(`${apiBase}/saturn-api/api/stats/monthly?chatId=${encodeURIComponent(chatId)}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<{ users: User[] }>
      })
      .then(data => {
        if (!data.users.length) {
          setStatus('empty')
        } else {
          setUsers(data.users)
          setStatus('ok')
        }
      })
      .catch(e => {
        setErrorMsg(String(e.message))
        setStatus('error')
      })
  }, [])

  const chartHeight = Math.max(users.length * 48 + 40, 100)

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100vh', padding: '20px 16px' }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>
        Топ за месяц по сообщениям
      </h1>

      {status === 'loading' && <p style={{ color: theme.hint }}>Загрузка...</p>}
      {status === 'error' && <p style={{ color: theme.hint }}>{errorMsg}</p>}
      {status === 'empty' && <p style={{ color: theme.hint }}>Нет данных за этот месяц</p>}

      {status === 'ok' && (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={users} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }}>
            <XAxis
              type="number"
              tick={{ fill: theme.hint, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fill: theme.text, fontSize: 13 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="count" fill={theme.accent} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
