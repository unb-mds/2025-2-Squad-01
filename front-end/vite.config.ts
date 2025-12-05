import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure assets resolve correctly when hosted under GitHub Pages project path
  // Use base path only in production (GitHub Pages)
  base: process.env.NODE_ENV === 'production' ? "/2025-2-Squad-01/" : "/",
})
