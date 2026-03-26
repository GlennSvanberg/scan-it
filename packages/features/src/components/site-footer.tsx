import { Github, Mail, Phone } from 'lucide-react'
import type { ReactNode } from 'react'

function XSocialIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const iconWrap =
  'inline-flex size-8 items-center justify-center rounded-full border border-border/50 bg-background/60 text-muted-foreground transition-colors hover:border-primary/35 hover:bg-primary/8 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

export type SiteFooterProps = {
  /** Link to the full Terms of Service page (e.g. router Link or &lt;a&gt;). */
  termsLink: ReactNode
  /** Optional Privacy Policy link (marketing site). */
  privacyLink?: ReactNode
  /** Optional About link (marketing site). */
  aboutLink?: ReactNode
}

export function SiteFooter({ termsLink, privacyLink, aboutLink }: SiteFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border/50 bg-muted/10">
      <div className="container mx-auto flex max-w-4xl flex-col items-center justify-center gap-3 px-4 py-5 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-6 sm:gap-y-2 md:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:justify-start">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Scan It
          </span>
          <span className="text-muted-foreground/40" aria-hidden>
            ·
          </span>
          <span className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
            {termsLink}
            {privacyLink ? (
              <>
                <span className="text-muted-foreground/40" aria-hidden>
                  ·
                </span>
                {privacyLink}
              </>
            ) : null}
            {aboutLink ? (
              <>
                <span className="text-muted-foreground/40" aria-hidden>
                  ·
                </span>
                {aboutLink}
              </>
            ) : null}
          </span>
        </div>

        <nav
          className="flex items-center gap-2"
          aria-label="Social and contact"
        >
          <a
            href="tel:+46735029113"
            className={iconWrap}
            aria-label="Phone: +46735029113"
          >
            <Phone className="size-3.5 shrink-0" strokeWidth={2} />
          </a>
          <a
            href="mailto:signeratsvanberg@gmail.com"
            className={iconWrap}
            aria-label="Email signeratsvanberg@gmail.com"
          >
            <Mail className="size-3.5 shrink-0" strokeWidth={2} />
          </a>
          <a
            href="https://x.com/GlennSvanberg"
            target="_blank"
            rel="noopener noreferrer"
            className={iconWrap}
            aria-label="X @GlennSvanberg"
          >
            <XSocialIcon className="size-3.5 shrink-0" />
          </a>
          <a
            href="https://github.com/GlennSvanberg/scan-it"
            target="_blank"
            rel="noopener noreferrer"
            className={iconWrap}
            aria-label="Scan It on GitHub"
          >
            <Github className="size-3.5 shrink-0" strokeWidth={2} />
          </a>
        </nav>

        <p className="text-center text-[11px] leading-snug text-muted-foreground sm:ml-auto sm:text-right">
          <span className="tabular-nums">© {year} Scan It</span>
          <span className="text-muted-foreground/40" aria-hidden>
            {' '}
            ·{' '}
          </span>
          <a
            href="https://github.com/GlennSvanberg/scan-it/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground/80 underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary hover:decoration-primary"
          >
            Open source (MIT)
          </a>
        </p>
      </div>
    </footer>
  )
}
