import { Link } from '@tanstack/react-router'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SiteHeader,
} from '@scan-it/features'

const DEFAULT_DOWNLOAD =
  'https://github.com/GlennSvanberg/scan-it/releases/latest/download/scan-it-windows-portable.zip'

export function LandingPage() {
  const downloadUrl =
    import.meta.env.VITE_DESKTOP_DOWNLOAD_URL?.trim() || DEFAULT_DOWNLOAD

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col px-4 pb-20 pt-8 md:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-10">
          <div className="space-y-4 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-muted-foreground">
              Phone → Convex → Desktop
            </p>
            <h1 className="text-4xl font-bold uppercase tracking-tight text-foreground md:text-6xl dark:text-glow">
              Scan It
            </h1>
            <p className="mx-auto max-w-md font-mono text-sm leading-relaxed text-muted-foreground">
              Use your phone as a wireless barcode and QR scanner. Scans show up
              on your computer in real time—no accounts, one phone at a time.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
            <Button asChild size="lg" className="uppercase tracking-wide">
              <a href={downloadUrl}>Download desktop app</a>
            </Button>
            <Button asChild size="lg" variant="secondary" className="uppercase tracking-wide">
              <Link to="/start">Use in browser</Link>
            </Button>
          </div>

          <Card className="border-primary/25 text-left shadow-glow-sm">
            <CardHeader>
              <CardTitle>Why install the desktop app?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm text-muted-foreground">
              <p>
                The <span className="font-medium text-foreground">Windows desktop app</span>{' '}
                can send each new scan as keystrokes into{' '}
                <span className="text-foreground">whatever application is focused</span>
                —Excel, ERP forms, terminal windows, and more. That is only possible
                with a native app on your machine.
              </p>
              <p>
                In the <span className="font-medium text-foreground">browser</span>, for
                security the page cannot type into other programs. You can still use the
                full desk: see scans in the log, optionally{' '}
                <span className="text-foreground">copy new scans to the clipboard</span>, or
                paste from there into any app yourself.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
