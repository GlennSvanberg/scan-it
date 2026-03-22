/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAIRING_ORIGIN?: string
  readonly VITE_CONVEX_URL?: string
  readonly VITE_DESKTOP_DOWNLOAD_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
