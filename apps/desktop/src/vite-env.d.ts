/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string
  readonly VITE_PAIRING_ORIGIN?: string
  /** When set, Tauri desk QR uses this origin (e.g. `https://host:1420`) instead of `VITE_PAIRING_ORIGIN`. */
  readonly VITE_DESKTOP_PAIRING_ORIGIN?: string
  readonly VITE_DESKTOP_DOWNLOAD_URL?: string
  readonly VITE_DESKTOP_WINDOWS_INSTALLER_URL?: string
  readonly VITE_DESKTOP_WINDOWS_PORTABLE_URL?: string
  readonly VITE_DESKTOP_MAC_DMG_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
