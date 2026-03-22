/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string
  /** When set, pairing QR encodes this origin (e.g. http://192.168.1.5:3000) instead of window.location.origin. */
  readonly VITE_PAIRING_ORIGIN?: string
  /** Landing page “Download desktop” link (e.g. GitHub Release asset URL). */
  readonly VITE_DESKTOP_DOWNLOAD_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
