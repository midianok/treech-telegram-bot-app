const TG_BLUE = '#2AABEE'
const TG_BLUE_DIM = '#1C8FCC'

export interface Theme {
  accent: string
  accentDim: string
  bg: string
  surface: string
  divider: string
  text: string
  textMuted: string
  textDim: string
  tabBarBg: string
  tabBarBorder: string
  shadow: string
  chip: string
  success: string
}

export function useTheme(): Theme {
  const dark = window.Telegram?.WebApp?.colorScheme === 'dark'
  return dark ? {
    accent: TG_BLUE,
    accentDim: TG_BLUE_DIM,
    bg: '#0E1621',
    surface: '#17212B',
    divider: 'rgba(255,255,255,0.07)',
    text: '#FFFFFF',
    textMuted: 'rgba(235,235,245,0.6)',
    textDim: 'rgba(235,235,245,0.35)',
    tabBarBg: 'rgba(23,33,43,0.92)',
    tabBarBorder: 'rgba(255,255,255,0.06)',
    shadow: '0 1px 0 rgba(255,255,255,0.02)',
    chip: '#24313F',
    success: '#4FCF6A',
  } : {
    accent: TG_BLUE,
    accentDim: TG_BLUE_DIM,
    bg: '#EFEFF4',
    surface: '#FFFFFF',
    divider: 'rgba(60,60,67,0.11)',
    text: '#000000',
    textMuted: 'rgba(60,60,67,0.6)',
    textDim: 'rgba(60,60,67,0.3)',
    tabBarBg: 'rgba(255,255,255,0.92)',
    tabBarBorder: 'rgba(60,60,67,0.1)',
    shadow: '0 1px 0 rgba(0,0,0,0.04)',
    chip: '#F0F0F3',
    success: '#34C759',
  }
}
