import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure assets resolve correctly when hosted under GitHub Pages project path
  base: "/2025-2-Squad-01/",
})
