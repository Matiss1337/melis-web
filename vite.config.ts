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
        name: 'Vakara Spēles',
        short_name: 'Vakara Spēles',
        description: 'Latviešu vakara spēļu kolekcija telefonam.',
        lang: 'lv',
        display: 'fullscreen',
        theme_color: '#f97316',
        background_color: '#fff7ed',
        icons: [
          { src: 'vakara-speles-icon-192.png', sizes: '192x192', type: 'image/png' },
        ],
      },
    }),
  ],
})
