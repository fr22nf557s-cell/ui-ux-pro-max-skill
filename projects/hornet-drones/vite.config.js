import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // The three.js vendor chunk is ~820KB raw, but it is lazy-loaded and never
    // touches first paint, so the default 500KB warning is not meaningful here.
    chunkSizeWarningLimit: 900,
    // three.js is heavy and only needed by the hero canvas, which is React.lazy()'d.
    // Splitting it keeps the above-the-fold JS payload small.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber'],
        },
      },
    },
  },
})
