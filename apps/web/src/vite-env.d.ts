/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string
  /** When set, pairing QR encodes this origin (e.g. http://192.168.1.5:3000) instead of window.location.origin. */
  readonly VITE_PAIRING_ORIGIN?: string
  /** Used by shared desk UI when built for Tauri; web dev can ignore. */
  readonly VITE_DESKTOP_PAIRING_ORIGIN?: string
  /** Legacy: overrides primary download button only; “All downloads” still use per-file URLs unless those are set. */
  readonly VITE_DESKTOP_DOWNLOAD_URL?: string
  readonly VITE_DESKTOP_WINDOWS_INSTALLER_URL?: string
  readonly VITE_DESKTOP_WINDOWS_PORTABLE_URL?: string
  readonly VITE_DESKTOP_MAC_DMG_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
