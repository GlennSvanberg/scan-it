/** Pairing base URL for QR codes (phone opens /s/:publicId on the web app). */
export function getPairingOrigin(
  env: { VITE_PAIRING_ORIGIN?: string },
  windowOrigin?: string,
): string {
  const raw = env.VITE_PAIRING_ORIGIN
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (t.length > 0) return t.replace(/\/+$/, '')
  }
  return typeof windowOrigin === 'string' ? windowOrigin : ''
}
