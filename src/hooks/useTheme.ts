import { ACCENT, BG_DARK, BG_LIGHT, BORDER, BORDER_DARK, SURFACE, SURFACE_DARK, TEXT_SECONDARY } from '../colors'

export interface Theme {
  bg: string
  text: string
  hint: string
  accent: string
  surface: string
  border: string
  secondary: string
  isDark: boolean
}

export function useTheme(): Theme {
  const tg = window.Telegram?.WebApp
  const p = tg?.themeParams ?? {}
  const dark = tg?.colorScheme === 'dark'
  return {
    bg:        p.bg_color           ?? (dark ? BG_DARK  : BG_LIGHT),
    text:      p.text_color         ?? (dark ? '#ffffff' : '#000000'),
    hint:      p.hint_color         ?? TEXT_SECONDARY,
    accent:    p.button_color       ?? ACCENT,
    surface:   p.secondary_bg_color ?? (dark ? SURFACE_DARK : SURFACE),
    border:    dark ? BORDER_DARK : BORDER,
    secondary: p.hint_color         ?? TEXT_SECONDARY,
    isDark:    dark,
  }
}
