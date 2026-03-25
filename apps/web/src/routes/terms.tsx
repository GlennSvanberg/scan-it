import { Link, createFileRoute } from '@tanstack/react-router'
import { SiteFooter, SiteHeader, TermsOfServiceContent } from '@scan-it/features'
import { pageMeta } from '~/lib/seo-head'

export const Route = createFileRoute('/terms')({
  ssr: false,
  head: () => ({
    meta: pageMeta({
      title: 'Terms of Service | Scan It',
      description:
        'Terms of Service for Scan It: pairing, scan data, acceptable use, and limitations of liability.',
      path: '/terms',
    }) as never,
  }),
  component: TermsOfServicePage,
})

function TermsOfServicePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-border/40 bg-muted/15">
          <div className="container mx-auto max-w-2xl px-4 py-10 md:px-6 md:py-14">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Legal
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Please read these terms before using Scan It. They include important
              information about scan data sent to our servers and limitations of liability.
            </p>
          </div>
        </div>
        <article className="container mx-auto max-w-2xl px-4 py-12 md:px-6 md:pb-20">
          <TermsOfServiceContent />
          <div className="mt-14 border-t border-border/60 pt-10">
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
