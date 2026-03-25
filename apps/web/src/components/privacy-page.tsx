import { Link } from '@tanstack/react-router'
import { SiteFooter, SiteHeader } from '@scan-it/features'

export function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <div className="border-b border-border/40 bg-muted/15">
          <div className="mx-auto max-w-2xl px-6 py-10 md:px-12 md:py-14">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Legal
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              This policy explains what Scan It processes when you use the service
              and how to contact us with questions.
            </p>
          </div>
        </div>
        <article className="mx-auto max-w-2xl space-y-6 px-6 py-12 text-sm leading-relaxed text-muted-foreground md:px-12 md:pb-20">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              What Scan It does
            </h2>
            <p>
              Scan It lets you pair a phone to a desk session and send barcode or QR
              scan values to your computer in real time. Some features may call
              external services to enrich product data (for example public product
              databases). The Terms of Service describe how scan data is handled in
              more detail.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              Data you send
            </h2>
            <p>
              Scan content and related session data may be transmitted to Scan It
              servers to operate pairing, routing, and optional enrichment. Do not
              use Scan It to process regulated health data or other categories
              where the product is not intended.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Cookies</h2>
            <p>
              This site may use standard browser storage and cookies as needed for
              sessions, preferences, and security. You can control cookies through
              your browser settings.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Contact</h2>
            <p>
              Questions about privacy: contact details are in the site footer
              (email and phone). You can also open an issue on the public GitHub
              repository for product feedback.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Changes</h2>
            <p>
              This policy may be updated as the product evolves. Material changes
              will be reflected on this page with an updated revision date when
              practical.
            </p>
          </section>
          <p className="text-xs text-muted-foreground/80">
            Last updated: March 2026
          </p>
          <div className="border-t border-border/60 pt-10">
            <Link
              to="/"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              ← Back to home
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
