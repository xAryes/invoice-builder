import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-pdf': ['jspdf', 'html2canvas'],
          'vendor-motion': ['framer-motion'],
          'vendor-router': ['react-router-dom'],
        },
      },
    },
  },
})
