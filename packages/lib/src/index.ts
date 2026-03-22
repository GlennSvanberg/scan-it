export {
  clearDeskToken,
  deskStorageKey,
  readDeskToken,
  saveDeskToken,
} from './desk-token.ts'
export { getOrCreateDeviceId } from './device-id.ts'
export { getPairingOrigin } from './pairing.ts'
export { cn } from './utils.ts'
export { convexHttpSiteOrigin } from './convex-http-site.ts'
export {
  allDesktopDownloadRows,
  DEFAULT_DESKTOP_RELEASE_BASE,
  detectClientDesktopKind,
  getPrimaryDesktopDownloadHref,
  primaryDesktopDownloadLabel,
  resolveDesktopDownloadUrls,
} from './desktop-download.ts'
export type {
  DesktopDownloadEnvSource,
  DesktopDownloadRow,
  DesktopKind,
  ResolvedDesktopDownloads,
} from './desktop-download.ts'
