import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/melis-web/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Melis',
        short_name: 'Melis',
        lang: 'lv',
        display: 'standalone',
        theme_color: '#f97316',
        background_color: '#fff7ed',
      },
    }),
  ],
})
