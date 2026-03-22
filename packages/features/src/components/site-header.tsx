import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { ThemeToggle } from './theme-toggle.tsx'
import { Button } from './ui/button.tsx'

const brandClassName =
  'text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary'

const brandStaticClassName =
  'text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground select-none'

export type SiteHeaderProps = {
  /** When set, shows a Back control that ends the desk flow (caller handles navigation + disconnect). */
  onBrandClick?: () => void | Promise<void>
}

export function SiteHeader({ onBrandClick }: SiteHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-8">
      {onBrandClick ? (
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => void onBrandClick()}
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Back
          </Button>
          <span className={brandStaticClassName}>Scan It</span>
        </div>
      ) : (
        <Link to="/" className={brandClassName}>
          Scan It
        </Link>
      )}
      <ThemeToggle />
    </header>
  )
}
