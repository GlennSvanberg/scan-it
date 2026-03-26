import { Link } from '@tanstack/react-router'
import { SiteFooter } from '@scan-it/features'
import { canonicalUrlForPath, webAppSiteOrigin } from '~/lib/seo-head'

export type ArticleSection = {
  heading?: string
  paragraphs?: Array<string>
  bullets?: Array<string>
  orderedSteps?: Array<string>
}

export type ArticleFaqItem = {
  question: string
  answer: string
}

export type MarketingArticle = {
  path: string
  title: string
  description: string
  h1: string
  intro?: string
  sections: Array<ArticleSection>
  /** Visible FAQ + FAQPage JSON-LD when set (answers must match on-page text). */
  faq?: Array<ArticleFaqItem>
}

function articleJsonLd(article: MarketingArticle) {
  const url = canonicalUrlForPath(article.path)
  const origin = webAppSiteOrigin()
  if (!url || !origin) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.h1,
    description: article.description,
    url,
    author: {
      '@type': 'Organization',
      name: 'Scan It',
      url: `${origin}/`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Scan It',
      url: `${origin}/`,
    },
  }
}

function faqPageJsonLd(faq: Array<ArticleFaqItem>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function MarketingArticlePage({ article }: { article: MarketingArticle }) {
  const articleLd = articleJsonLd(article)
  const faqLd = article.faq?.length ? faqPageJsonLd(article.faq) : null

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {articleLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
        />
      ) : null}
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}
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
              {section.paragraphs?.map((p, j) => (
                <p
                  key={j}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  {p}
                </p>
              ))}
              {section.orderedSteps?.length ? (
                <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {section.orderedSteps.map((step, j) => (
                    <li key={j}>{step}</li>
                  ))}
                </ol>
              ) : null}
              {section.bullets?.length ? (
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {section.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          {article.faq?.length ? (
            <section className="space-y-4 border-t border-border/60 pt-10">
              <h2 className="text-lg font-semibold text-foreground">
                Frequently asked questions
              </h2>
              <dl className="space-y-6">
                {article.faq.map((item, i) => (
                  <div key={i}>
                    <dt className="text-sm font-medium text-foreground">
                      {item.question}
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
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
            to="/guides"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            All guides
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
