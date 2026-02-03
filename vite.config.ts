import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 🚨 CONFIG SIMPLIFICADA - FORÇAR REACT
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
