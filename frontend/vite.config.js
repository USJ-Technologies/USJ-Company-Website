import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    rollupOptions: {
      output: {
        // rolldown (Vite 8) requires manualChunks as a function
        manualChunks: (id) => {
          if (id.includes('node_modules/@supabase')) return 'vendor-supabase';
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/lucide-react')) return 'vendor-ui';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) return 'vendor-react';
          if (id.includes('node_modules/zustand') || id.includes('node_modules/react-hot-toast') || id.includes('node_modules/axios')) return 'vendor-misc';
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  // No local proxy needed — frontend talks directly to Supabase
  server: {
    port: 5173,
  },
})
