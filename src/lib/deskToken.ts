export function deskStorageKey(publicId: string) {
  return `scan-it-desk-token-${publicId}`
}

export function saveDeskToken(publicId: string, deskToken: string) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(deskStorageKey(publicId), deskToken)
}

export function readDeskToken(publicId: string): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(deskStorageKey(publicId))
}

export function clearDeskToken(publicId: string) {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(deskStorageKey(publicId))
}
