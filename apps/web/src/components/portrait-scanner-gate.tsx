import * as React from 'react'
import { cn } from '@scan-it/lib'

/**
 * Blocks the scanner UI in landscape on coarse-pointer devices (phones/tablets).
 * Fine-pointer desktops are never blocked so devtools / landscape testing on PC works.
 * Programmatic orientation lock is attempted from PhoneScanner on user gesture (best-effort).
 * Standalone PWA orientation is controlled by site.webmanifest — see plan if you need global portrait.
 *
 * The tree shape is always the same (wrapper + overlay sibling + children) so toggling the
 * overlay does not remount children — otherwise PhoneScanner would unmount and the camera
 * stream would stop every time orientation changed.
 */
export function PortraitScannerGate({ children }: { children: React.ReactNode }) {
  const [mustRotate, setMustRotate] = React.useState(false)

  React.useEffect(() => {
    const portraitMq = window.matchMedia('(orientation: portrait)')
    const coarseMq = window.matchMedia('(pointer: coarse)')

    const sync = () => {
      const landscape = !portraitMq.matches
      const coarse = coarseMq.matches
      setMustRotate(landscape && coarse)
    }

    sync()
    portraitMq.addEventListener('change', sync)
    coarseMq.addEventListener('change', sync)
    window.addEventListener('resize', sync)

    return () => {
      portraitMq.removeEventListener('change', sync)
      coarseMq.removeEventListener('change', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        role={mustRotate ? 'alert' : undefined}
        aria-hidden={!mustRotate}
        className={cn(
          'fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/95 p-6 text-center backdrop-blur-sm',
          !mustRotate && 'pointer-events-none invisible',
        )}
      >
        <p className="max-w-xs text-lg font-semibold tracking-tight">
          Rotate your phone to portrait
        </p>
        <p className="max-w-xs text-sm text-muted-foreground">
          The scanner works in portrait mode so the camera lines up with codes reliably.
        </p>
      </div>
      {children}
    </div>
  )
}
