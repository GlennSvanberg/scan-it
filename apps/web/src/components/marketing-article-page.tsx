import { Link } from '@tanstack/react-router'
import { SiteFooter } from '@scan-it/features'

export type ArticleSection = {
  heading?: string
  paragraphs: Array<string>
}

export type MarketingArticle = {
  path: string
  title: string
  description: string
  h1: string
  intro?: string
  sections: Array<ArticleSection>
}

export function MarketingArticlePage({ article }: { article: MarketingArticle }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border px-6 py-4 md:px-12">
        <Link
          to="/"
          className="text-[10px] font-medium uppercase tracking-[0.35em] text-muted-foreground transition-colors hover:text-primary"
        >
          Scan It
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12 md:px-12 md:py-16">
        <article className="space-y-10">
          <header className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {article.h1}
            </h1>
            {article.intro ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {article.intro}
              </p>
            ) : null}
          </header>

          {article.sections.map((section, i) => (
            <section key={i} className="space-y-3">
              {section.heading ? (
                <h2 className="text-lg font-semibold text-foreground">
                  {section.heading}
                </h2>
              ) : null}
              {section.paragraphs.map((p, j) => (
                <p
                  key={j}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  {p}
                </p>
              ))}
            </section>
          ))}
        </article>

        <nav
          className="mt-14 flex flex-wrap gap-x-4 gap-y-2 border-t border-border/60 pt-10 text-sm"
          aria-label="Related pages"
        >
          <Link
            to="/"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Home
          </Link>
          <span className="text-muted-foreground/50">·</span>
          <Link
            to="/wireless-barcode-scanner"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Wireless scanner
          </Link>
          <span className="text-muted-foreground/50">·</span>
          <Link
            to="/barcode-scanner-for-excel"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Excel
          </Link>
        </nav>
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
