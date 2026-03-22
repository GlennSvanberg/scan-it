import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')

// @ts-expect-error process is a nodejs global
const tauriDevHost = process.env.TAURI_DEV_HOST?.trim()

function hostnamesFromPairingEnv(env: Record<string, string>): string[] {
  const keys = ['VITE_PAIRING_ORIGIN', 'VITE_DESKTOP_PAIRING_ORIGIN'] as const
  const hosts: string[] = []
  for (const key of keys) {
    try {
      const u = env[key]?.trim()
      if (!u) continue
      const host = new URL(u).hostname
      if (host) hosts.push(host)
    } catch {
      /* ignore invalid URL */
    }
  }
  return hosts
}

function sslExtraDomains(env: Record<string, string>): string[] {
  const fromEnv = (env.VITE_DEV_SSL_DOMAINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return [...new Set([...hostnamesFromPairingEnv(env), ...fromEnv])]
}

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, repoRoot, '')
  // `envDir` is the repo root, so root `.env.local` is loaded by default. Overlay
  // `apps/desktop/.env*` so desktop-only vars (e.g. `VITE_DESKTOP_PAIRING_ORIGIN`) work
  // without duplicating everything at the repo root.
  const desktopEnv = loadEnv(mode, __dirname, '')
  const merged = { ...rootEnv, ...desktopEnv }
  const devPublicHost = merged.VITE_DEV_PUBLIC_HOST?.trim()
  const sslDomains = sslExtraDomains(merged)

  const defineDesktopViteEnv = Object.fromEntries(
    Object.entries(desktopEnv)
      .filter(([k]) => k.startsWith('VITE_'))
      .map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)]),
  )

  return {
    envDir: repoRoot,
    define: defineDesktopViteEnv,
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ['./tsconfig.json'] }),
      // HTTPS in dev matches tauri.conf `devUrl` and allows phone / secure-context APIs on LAN.
      basicSsl({
        domains: sslDomains.length > 0 ? sslDomains : undefined,
      }),
      react(),
    ],
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
              protocol: 'wss' as const,
              host: tauriDevHost,
              port: 1421,
            },
          }
        : devPublicHost
          ? {
              hmr: {
                host: devPublicHost,
                protocol: 'wss' as const,
              },
            }
          : {}),
      watch: {
        ignored: ['**/src-tauri/**'],
      },
    },
  }
})
