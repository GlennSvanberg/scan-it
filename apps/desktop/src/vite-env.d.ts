/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string
  readonly VITE_PAIRING_ORIGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
