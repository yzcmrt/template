import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // Eski tarayıcı uyumluluğu için bu hedefi ekleyin
  build: {
    target: 'es2015'
  }
})
