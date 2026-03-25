import { Link } from '@tanstack/react-router'
import { SiteFooter, SiteHeader } from '@scan-it/features'

export function AboutPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-12 md:px-12 md:py-16">
        <article className="space-y-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            About
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Scan It
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Scan It is a small utility focused on one job: make phone cameras
            useful as wireless barcode and QR scanners for your computer. The
            product is built for real desk workflows—inventory, receiving, events,
            and spreadsheets—without forcing you to buy another piece of
            hardware.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The project is developed in the open on GitHub. Feedback is welcome
            through issues and community discussion.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <a
              href="https://github.com/GlennSvanberg/scan-it"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              View on GitHub
            </a>
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              ← Home
            </Link>
          </div>
        </article>
      </main>

      <SiteFooter
        termsLink={
          <Link
            to="/terms"
            className="font-medium text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
          >
            Terms of Service
          </Link>
        }
        privacyLink={
          <Link
            to="/privacy"
            className="font-medium text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
          >
            Privacy
          </Link>
        }
        aboutLink={
          <Link
            to="/about"
            className="font-medium text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
          >
            About
          </Link>
        }
      />
    </div>
  )
}
