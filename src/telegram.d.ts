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
