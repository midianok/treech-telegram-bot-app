/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_DEBUG_CHAT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
