/** GitHub Releases "latest" stable asset names — must match release-desktop.yml uploads. */
export const DEFAULT_DESKTOP_RELEASE_BASE =
  'https://github.com/GlennSvanberg/scan-it/releases/latest/download'

export type DesktopKind = 'windows' | 'mac' | 'other'

export type DesktopDownloadEnvSource = {
  readonly VITE_DESKTOP_DOWNLOAD_URL?: string
  readonly VITE_DESKTOP_WINDOWS_INSTALLER_URL?: string
  readonly VITE_DESKTOP_WINDOWS_PORTABLE_URL?: string
  readonly VITE_DESKTOP_MAC_DMG_URL?: string
}

export type ResolvedDesktopDownloads = {
  windowsInstaller: string
  windowsPortable: string
  macDmg: string
  /** When set, use as primary CTA href on every platform; all-asset links still use per-file URLs. */
  legacyPrimaryUrl: string | undefined
}

function trimEnv(s: string | undefined): string | undefined {
  const t = s?.trim()
  return t || undefined
}

export function detectClientDesktopKind(): DesktopKind {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua)) return 'other'
  if (/Macintosh|Mac OS X|MacIntel/i.test(ua)) return 'mac'
  const ud = (navigator as Navigator & { userAgentData?: { platform?: string } })
    .userAgentData
  if (ud?.platform === 'macOS') return 'mac'
  if (ud?.platform === 'Windows') return 'windows'
  if (/Win(dows)?[ /]/i.test(ua)) return 'windows'
  return 'other'
}

export function resolveDesktopDownloadUrls(
  env: DesktopDownloadEnvSource,
): ResolvedDesktopDownloads {
  const windowsInstaller =
    trimEnv(env.VITE_DESKTOP_WINDOWS_INSTALLER_URL) ??
    `${DEFAULT_DESKTOP_RELEASE_BASE}/scan-it-windows-setup.exe`
  const windowsPortable =
    trimEnv(env.VITE_DESKTOP_WINDOWS_PORTABLE_URL) ??
    `${DEFAULT_DESKTOP_RELEASE_BASE}/scan-it-windows-portable.zip`
  const macDmg =
    trimEnv(env.VITE_DESKTOP_MAC_DMG_URL) ??
    `${DEFAULT_DESKTOP_RELEASE_BASE}/scan-it-macos.dmg`
  return {
    windowsInstaller,
    windowsPortable,
    macDmg,
    legacyPrimaryUrl: trimEnv(env.VITE_DESKTOP_DOWNLOAD_URL),
  }
}

export function getPrimaryDesktopDownloadHref(
  urls: ResolvedDesktopDownloads,
  kind: DesktopKind,
): string {
  if (urls.legacyPrimaryUrl) return urls.legacyPrimaryUrl
  if (kind === 'mac') return urls.macDmg
  if (kind === 'windows') return urls.windowsInstaller
  return urls.windowsInstaller
}

export function primaryDesktopDownloadLabel(kind: DesktopKind): string {
  if (kind === 'mac') return 'Download for Mac'
  if (kind === 'windows') return 'Download for Windows'
  return 'Download desktop app'
}

export type DesktopDownloadRow = { label: string; href: string }

export function allDesktopDownloadRows(
  urls: ResolvedDesktopDownloads,
): Array<DesktopDownloadRow> {
  return [
    { label: 'Windows — Installer (.exe)', href: urls.windowsInstaller },
    { label: 'Windows — Portable (ZIP)', href: urls.windowsPortable },
    { label: 'macOS — Disk image (.dmg)', href: urls.macDmg },
  ]
}
