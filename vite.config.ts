import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@xyflow/react')) return 'xyflow'
          if (id.includes('@tanstack/react-query')) return 'react-query'
          if (id.includes('@react-oauth/google')) return 'google-oauth'
        },
      },
    },
  },
})
