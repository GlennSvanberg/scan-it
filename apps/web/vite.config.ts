import basicSsl from '@vitejs/plugin-basic-ssl'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')

function sslExtraDomains(env: Record<string, string>): string[] {
  const fromPairing = (() => {
    try {
      const u = env.VITE_PAIRING_ORIGIN?.trim()
      if (!u) return []
      const host = new URL(u).hostname
      return host ? [host] : []
    } catch {
      return []
    }
  })()
  const fromEnv = (env.VITE_DEV_SSL_DOMAINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return [...new Set([...fromPairing, ...fromEnv])]
}

export default defineConfig(({ mode }) => {
  // Load `.env*` from monorepo root so one `.env.local` works for Convex + all Vite apps.
  const env = loadEnv(mode, repoRoot, '')
  const pairingHttps = /^https:\/\//i.test(env.VITE_PAIRING_ORIGIN?.trim() ?? '')
  const devHttps =
    env.VITE_DEV_HTTPS === '1' ||
    env.VITE_DEV_HTTPS === 'true' ||
    pairingHttps
  const sslDomains = sslExtraDomains(env)
  const devPublicHost = env.VITE_DEV_PUBLIC_HOST?.trim()

  return {
    envDir: repoRoot,
    resolve: {
      alias: {
        '@scan-it/convex-api': path.join(repoRoot, 'convex/_generated/api'),
      },
    },
    server: {
      port: 3000,
      // Listen on all interfaces so LAN / mDNS hostnames (e.g. fiwe-gsg3) work.
      host: '0.0.0.0',
      strictPort: true,
      allowedHosts: true,
      cors: {
        origin: true,
        credentials: true,
      },
      // When you open the app via a non-localhost host, point HMR at that host too
      // (otherwise the client may try wss://localhost and hot reload / dev UX breaks).
      ...(devPublicHost
        ? {
            hmr: {
              host: devPublicHost,
              ...(devHttps ? { protocol: 'wss' as const } : {}),
            },
          }
        : {}),
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      ...(devHttps
        ? [
            basicSsl({
              domains: sslDomains.length > 0 ? sslDomains : undefined,
            }),
          ]
        : []),
      tanstackStart(),
      nitro(),
      viteReact(),
    ],
  }
})
