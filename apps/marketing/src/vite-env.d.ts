/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** GitHub Releases "latest" portable ZIP URL */
  readonly VITE_DESKTOP_DOWNLOAD_URL?: string
  /** Public URL of the web app (for "Open app" CTA) */
  readonly VITE_WEB_APP_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
