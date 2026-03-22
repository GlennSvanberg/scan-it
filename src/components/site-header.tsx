import { Link } from '@tanstack/react-router'
import { ThemeToggle } from '~/components/theme-toggle'

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-8">
      <Link
        to="/"
        className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
      >
        Scan It
      </Link>
      <ThemeToggle />
    </header>
  )
}
