import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')

export default defineConfig({
  envDir: repoRoot,
  plugins: [tailwindcss(), react()],
  root: __dirname,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
