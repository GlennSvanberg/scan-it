import { Link, createFileRoute } from '@tanstack/react-router'
import { SiteFooter } from '@scan-it/features'
import { marketingArticles } from '~/content/marketing-articles'
import { pageMeta } from '~/lib/seo-head'

export const Route = createFileRoute('/guides')({
  ssr: false,
  head: () => ({
    meta: pageMeta({
      title: 'Guides — Scan It',
      description:
        'Topic pages for wireless barcode scanning, Excel and inventory workflows, use cases, and how Scan It compares to other phone-to-PC scanner tools.',
      path: '/guides',
    }) as never,
  }),
  component: GuidesPage,
})

function GuidesPage() {
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
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Guides</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Topic pages for common searches and workflows: how pairing works, when to use the
            browser desk versus the desktop app, and practical limits so you can decide if Scan It
            fits.
          </p>
        </header>

        <ul className="mt-10 space-y-6 border-t border-border/60 pt-10">
          {marketingArticles.map((a) => (
            <li key={a.path}>
              <Link
                to={a.path}
                className="text-base font-medium text-primary underline-offset-4 hover:underline"
              >
                {a.h1}
              </Link>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {a.description}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-12 text-sm text-muted-foreground">
          <Link
            to="/start"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Start a desk
          </Link>
          {' · '}
          <Link to="/" className="font-medium text-primary underline-offset-4 hover:underline">
            Home
          </Link>
        </p>
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
