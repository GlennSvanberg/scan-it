import { Link } from '@tanstack/react-router'
import { ThemeToggle } from './theme-toggle.tsx'

const brandClassName =
  'text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary'

export type SiteHeaderProps = {
  /** When set, the brand control ends the desk flow (caller handles navigation) instead of a plain home link. */
  onBrandClick?: () => void | Promise<void>
}

export function SiteHeader({ onBrandClick }: SiteHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-8">
      {onBrandClick ? (
        <button
          type="button"
          className={brandClassName}
          onClick={() => void onBrandClick()}
        >
          Scan It
        </button>
      ) : (
        <Link to="/" className={brandClassName}>
          Scan It
        </Link>
      )}
      <ThemeToggle />
    </header>
  )
}
