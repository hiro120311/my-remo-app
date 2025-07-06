
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // ← これを追加！
    allowedHosts: [
      'galleria.local',
      // 必要に応じて他のホストも追加可
    ],
    proxy: {
      '/messages': {
        target: 'http://192.168.1.25',
        changeOrigin: true,
      }
    }
  }
})
