const DEFAULT_DOWNLOAD =
  'https://github.com/OWNER/REPO/releases/latest/download/scan-it-windows-portable.zip'

export default function App() {
  const downloadUrl =
    import.meta.env.VITE_DESKTOP_DOWNLOAD_URL?.trim() || DEFAULT_DOWNLOAD
  const webAppUrl = import.meta.env.VITE_WEB_APP_URL?.trim() || '#'

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
            optional Windows desktop app to type scans into Excel and other
            programs.
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
              href={downloadUrl}
              className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-muted"
            >
              Download desktop (Windows, free)
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            Desktop build is a portable ZIP: extract and run the executable. Set{' '}
            <code className="rounded bg-muted px-1 font-mono text-[11px]">
              VITE_DESKTOP_DOWNLOAD_URL
            </code>{' '}
            on Vercel to your GitHub release asset URL.
          </p>
        </section>

        <section className="space-y-4 text-sm text-muted-foreground">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-foreground">
            Desktop app
          </h2>
          <p>
            The Windows app includes the same desk flow plus optional
            &quot;type into focused app&quot; so each new scan is sent as
            keystrokes to whatever window is active—useful for spreadsheets and
            line-of-business tools.
          </p>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground md:px-12">
        Scan It — phone to desktop scanning
      </footer>
    </div>
  )
}
