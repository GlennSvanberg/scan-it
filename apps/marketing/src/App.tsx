import { SiteFooter } from '@scan-it/features/site-footer'
import {
  allDesktopDownloadRows,
  detectClientDesktopKind,
  getPrimaryDesktopDownloadHref,
  primaryDesktopDownloadLabel,
  resolveDesktopDownloadUrls,
} from '@scan-it/lib'

export default function App() {
  const webAppUrl = import.meta.env.VITE_WEB_APP_URL?.trim() || '#'

  const desktopKind = detectClientDesktopKind()
  const desktopUrls = resolveDesktopDownloadUrls(import.meta.env)
  const desktopPrimaryHref = getPrimaryDesktopDownloadHref(
    desktopUrls,
    desktopKind,
  )
  const desktopPrimaryLabel = primaryDesktopDownloadLabel(desktopKind)
  const desktopAllRows = allDesktopDownloadRows(desktopUrls)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border px-6 py-4 md:px-12">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-muted-foreground">
          Scan It
        </p>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-16 px-6 py-16 md:px-12 md:py-24">
        <section className="space-y-6 text-center">
          <h1 className="text-4xl font-bold uppercase tracking-tight md:text-6xl dark:text-glow">
            Scan It
          </h1>
          <p className="mx-auto max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
            Use your phone as a wireless barcode and QR scanner. Scans show up on
            your computer in real time—use the web app in your browser or the
            optional desktop app (Windows or Mac) to type scans into Excel and
            other programs.
          </p>
        </section>

        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-8 shadow-glow-sm">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Get started
          </h2>
          <p className="text-sm text-muted-foreground">
            Open the web app on your PC, scan the pairing QR with your phone,
            and scan barcodes. No accounts required.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={webAppUrl}
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold uppercase tracking-wide text-primary-foreground shadow-glow-sm transition-colors hover:bg-primary/90"
            >
              Open web app
            </a>
            <a
              href={desktopPrimaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-muted"
            >
              {desktopPrimaryLabel}
            </a>
          </div>
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium text-foreground">
              All downloads
            </summary>
            <ul className="mt-2 space-y-1.5 list-none pl-0">
              {desktopAllRows.map((row) => (
                <li key={row.href}>
                  <a
                    href={row.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {row.label}
                  </a>
                </li>
              ))}
            </ul>
          </details>
          <p className="text-xs text-muted-foreground">
            Override URLs on Vercel with{' '}
            <code className="rounded bg-muted px-1 font-mono text-[11px]">
              VITE_DESKTOP_WINDOWS_INSTALLER_URL
            </code>
            ,{' '}
            <code className="rounded bg-muted px-1 font-mono text-[11px]">
              VITE_DESKTOP_WINDOWS_PORTABLE_URL
            </code>
            ,{' '}
            <code className="rounded bg-muted px-1 font-mono text-[11px]">
              VITE_DESKTOP_MAC_DMG_URL
            </code>
            , or legacy{' '}
            <code className="rounded bg-muted px-1 font-mono text-[11px]">
              VITE_DESKTOP_DOWNLOAD_URL
            </code>{' '}
            (primary button only).
          </p>
        </section>

        <section className="space-y-4 text-sm text-muted-foreground">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-foreground">
            Desktop app
          </h2>
          <p>
            The desktop app includes the same desk flow plus optional
            &quot;type into focused app&quot; so each new scan is sent as
            keystrokes to whatever window is active—useful for spreadsheets and
            line-of-business tools. Windows builds include an installer and a
            portable ZIP; Mac builds are distributed as a .dmg.
          </p>
        </section>
      </main>

      <SiteFooter
        termsLink={
          <a
            href="/terms"
            className="font-medium text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
          >
            Terms of Service
          </a>
        }
      />
    </div>
  )
}
