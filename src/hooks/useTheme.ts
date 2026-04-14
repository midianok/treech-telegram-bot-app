export interface Theme {
  bg: string
  text: string
  hint: string
  accent: string
}

export function useTheme(): Theme {
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