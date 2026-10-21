import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // three.js only ever loads through the React.lazy() DroneScene import (the
    // hero's fallback when the footage cannot play). Left to Rollup it lands in
    // that lazy chunk and is never preloaded; a manualChunks entry for it made
    // Vite emit a <link rel="modulepreload"> for the whole 800 KB on every visit.
    chunkSizeWarningLimit: 900,
  },
})
