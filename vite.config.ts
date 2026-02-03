import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 🚨 CONFIG COM VARIÁVEL DE AMBIENTE DA VERCEL
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://ddevs-86w2.onrender.com/api')
  }
})
