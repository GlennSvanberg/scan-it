/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** When set, pairing QR encodes this origin (e.g. http://192.168.1.5:3000) instead of window.location.origin. */
  readonly VITE_PAIRING_ORIGIN?: string
}
