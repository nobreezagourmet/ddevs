import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 🚨 CONFIG COM VARIÁVEL DE AMBIENTE DA VERCEL E CACHE BREAK
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
      }
    }
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://ddevs-86w2.onrender.com/api'),
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString())
  }
})
