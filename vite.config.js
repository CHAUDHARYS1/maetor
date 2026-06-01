import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/maetor/',
  server: {
    watch: { usePolling: true, interval: 300 },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'icons':  ['@phosphor-icons/react'],
          'globe':  ['react-globe.gl', 'three'],
        },
      },
    },
  },
})
