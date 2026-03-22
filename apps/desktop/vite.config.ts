import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')

// @ts-expect-error process is a nodejs global
const tauriDevHost = process.env.TAURI_DEV_HOST?.trim()

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, '')
  const devPublicHost = env.VITE_DEV_PUBLIC_HOST?.trim()

  return {
    envDir: repoRoot,
    plugins: [tailwindcss(), tsConfigPaths({ projects: ['./tsconfig.json'] }), react()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src'),
        '@scan-it/convex-api': path.join(repoRoot, 'convex/_generated/api'),
      },
    },
    clearScreen: false,
    server: {
      port: 1420,
      strictPort: true,
      // Without this, Vite binds to localhost only and hostnames like fiwe-gsg3:1420 never connect.
      // When Tauri CLI sets TAURI_DEV_HOST (some external-device flows), keep that bind address.
      host: tauriDevHost || true,
      allowedHosts: true,
      ...(tauriDevHost
        ? {
            hmr: {
              protocol: 'ws' as const,
              host: tauriDevHost,
              port: 1421,
            },
          }
        : devPublicHost
          ? {
              hmr: {
                host: devPublicHost,
              },
            }
          : {}),
      watch: {
        ignored: ['**/src-tauri/**'],
      },
    },
  }
})
