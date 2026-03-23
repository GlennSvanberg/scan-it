import { SiteHeader } from '@scan-it/features/site-header'
import { TermsOfServiceContent } from '@scan-it/features/terms-of-service-content'

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader homeHref="/" />
      <main>
        <div className="border-b border-border/40 bg-muted/15">
          <div className="mx-auto max-w-2xl px-6 py-10 md:px-12 md:py-14">
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
        <article className="mx-auto max-w-2xl px-6 py-12 md:px-12 md:pb-20">
          <TermsOfServiceContent />
          <div className="mt-14 border-t border-border/60 pt-10">
            <a
              href="/"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              ← Back to home
            </a>
          </div>
        </article>
      </main>
    </div>
  )
}
