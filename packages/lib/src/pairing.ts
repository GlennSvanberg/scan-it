export type PairingEnv = {
  VITE_PAIRING_ORIGIN?: string
  /** Tauri desk dev: base URL for QR (e.g. `https://host:1420`) when the phone hits the desktop Vite server. */
  VITE_DESKTOP_PAIRING_ORIGIN?: string
}

/** Pairing base URL for QR codes (phone opens /s/:publicId on the web app). */
export function getPairingOrigin(
  env: Pick<PairingEnv, 'VITE_PAIRING_ORIGIN'>,
  windowOrigin?: string,
): string {
  const raw = env.VITE_PAIRING_ORIGIN
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (t.length > 0) return t.replace(/\/+$/, '')
  }
  return typeof windowOrigin === 'string' ? windowOrigin : ''
}

/**
 * Desk QR base: Tauri (`desktopDesk`) may use `VITE_DESKTOP_PAIRING_ORIGIN` so LAN phones use the
 * desktop dev port (e.g. 1420) instead of `VITE_PAIRING_ORIGIN` (often the web app on 3000).
 */
export function resolvePairingBase(
  env: PairingEnv,
  windowOrigin: string | undefined,
  options: { desktopDesk?: boolean },
): string {
  if (options.desktopDesk) {
    const d = env.VITE_DESKTOP_PAIRING_ORIGIN
    if (typeof d === 'string') {
      const t = d.trim()
      if (t.length > 0) return t.replace(/\/+$/, '')
    }
  }
  return getPairingOrigin(env, windowOrigin)
}
