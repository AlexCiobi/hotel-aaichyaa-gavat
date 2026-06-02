import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 80, open: false },
  optimizeDeps: {
    esbuildOptions: {
      target: 'safari14',
    },
  },
  build: {
    target: ['es2020', 'safari14'],
  },
  esbuild: {
    target: 'safari14',
  },
})
