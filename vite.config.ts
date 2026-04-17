import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/tg-app/',
  server: {
    allowedHosts: true,
    proxy: {
      '/saturn-api': {
        target: 'http://localhost:5001',
        rewrite: (path) => path.replace(/^\/saturn-api/, ''),
      },
    },
  },
})
