/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Legacy: primary download button href for all platforms */
  readonly VITE_DESKTOP_DOWNLOAD_URL?: string
  readonly VITE_DESKTOP_WINDOWS_INSTALLER_URL?: string
  readonly VITE_DESKTOP_WINDOWS_PORTABLE_URL?: string
  readonly VITE_DESKTOP_MAC_DMG_URL?: string
  /** Public URL of the web app (for "Open app" CTA) */
  readonly VITE_WEB_APP_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
