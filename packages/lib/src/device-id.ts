const STORAGE_KEY = 'scan-it-device-id'

/** randomUUID() is secure-context only; LAN http:// IPs need a getRandomValues fallback. */
function newDeviceId(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') {
    return ''
  }
  let id = window.localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = newDeviceId()
    window.localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}
