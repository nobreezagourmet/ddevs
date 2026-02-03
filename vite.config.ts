import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://ddevs-86w2.onrender.com')
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js?v=999.0.0&t=${Date.now()}`,
        chunkFileNames: `assets/[name].[hash].js?v=999.0.0&t=${Date.now()}`,
        assetFileNames: `assets/[name].[hash].[ext]?v=999.0.0&t=${Date.now()}`
      }
    }
  }
})
