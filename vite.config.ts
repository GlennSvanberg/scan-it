import basicSsl from '@vitejs/plugin-basic-ssl'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig, loadEnv } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'

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
  const env = loadEnv(mode, process.cwd(), '')
  const pairingHttps = /^https:\/\//i.test(env.VITE_PAIRING_ORIGIN?.trim() ?? '')
  const devHttps =
    env.VITE_DEV_HTTPS === '1' ||
    env.VITE_DEV_HTTPS === 'true' ||
    pairingHttps
  const sslDomains = sslExtraDomains(env)

  return {
    server: {
      port: 3000,
      // Listen on all interfaces so phones on the same LAN can load the dev server
      host: true,
      // Tailscale MagicDNS, LAN hostnames, etc. (Vite 6+ blocks unknown Host by default)
      allowedHosts: true,
      cors: {
        origin: true,
        credentials: true,
      },
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      ...(devHttps
        ? [
            basicSsl({
              // Include pairing hostname in cert SAN (default cert is localhost-only).
              // If you change VITE_PAIRING_ORIGIN host, delete node_modules/.vite/basic-ssl once.
              domains: sslDomains.length > 0 ? sslDomains : undefined,
            }),
          ]
        : []),
      tanstackStart(),
      viteReact(),
    ],
  }
})
