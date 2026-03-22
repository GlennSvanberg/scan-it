import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import QRCode from 'react-qr-code'
import * as React from 'react'
import { api } from '../../convex/_generated/api'
import { SiteHeader } from '~/components/site-header'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { clearDeskToken, readDeskToken } from '~/lib/deskToken'

function pairingOrigin(): string {
  const raw = import.meta.env.VITE_PAIRING_ORIGIN
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (t.length > 0) return t.replace(/\/+$/, '')
  }
  return typeof window !== 'undefined' ? window.location.origin : ''
}

export const Route = createFileRoute('/desk/$publicId')({
  ssr: false,
  component: DeskPage,
})

function DeskPage() {
  const { publicId } = Route.useParams()
  const navigate = useNavigate()
  const [storageReady, setStorageReady] = React.useState(false)
  const [deskToken, setDeskToken] = React.useState<string | null>(null)
  const endSession = useMutation(api.scanSessions.endSession)
  const [ending, setEnding] = React.useState(false)
  const [scanToClipboard, setScanToClipboard] = React.useState(false)
  const [clipboardHint, setClipboardHint] = React.useState<string | null>(null)

  React.useEffect(() => {
    setDeskToken(readDeskToken(publicId))
    setStorageReady(true)
  }, [publicId])

  const data = useQuery(
    api.scanSessions.getDeskView,
    deskToken ? { publicId, deskToken } : 'skip',
  )

  const base = pairingOrigin()
  const pairUrl = base ? `${base}/s/${publicId}` : ''

  const clipboardPrimed = React.useRef(false)
  const lastId = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (data === undefined || data === null || !scanToClipboard) return
    const scans = data.scans
    if (scans.length === 0) {
      clipboardPrimed.current = true
      return
    }
    const latest = scans[scans.length - 1]
    if (!clipboardPrimed.current) {
      clipboardPrimed.current = true
      lastId.current = latest._id
      return
    }
    if (latest._id !== lastId.current) {
      lastId.current = latest._id
      void navigator.clipboard.writeText(latest.value).catch(() => {})
    }
  }, [data, scanToClipboard])

  const onScanToClipboardChange = (checked: boolean) => {
    setScanToClipboard(checked)
    setClipboardHint(null)
    if (!checked) return
    if (data === undefined || data === null) return
    const scans = data.scans
    if (scans.length > 0) {
      const latest = scans[scans.length - 1]
      lastId.current = latest._id
      clipboardPrimed.current = true
    }
    void navigator.clipboard.writeText('\u200b').catch(() => {
      setClipboardHint(
        'If auto-copy fails, use Copy latest or wait for the next scan.',
      )
    })
  }

  const onCopyLatest = () => {
    if (data === undefined || data === null) return
    const scans = data.scans
    if (scans.length === 0) return
    const latest = scans[scans.length - 1]
    void navigator.clipboard.writeText(latest.value)
  }

  const onEnd = async () => {
    if (!deskToken) return
    setEnding(true)
    try {
      await endSession({ publicId, deskToken })
      clearDeskToken(publicId)
      await navigate({ to: '/' })
    } finally {
      setEnding(false)
    }
  }

  if (!storageReady) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center p-6">
          <p className="text-muted-foreground">Loading…</p>
        </main>
      </div>
    )
  }

  if (!deskToken) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="max-w-md text-muted-foreground">
            This desk link is not valid for this browser. Start a new session
            from the home page on this computer.
          </p>
          <Button type="button" variant="secondary" onClick={() => void navigate({ to: '/' })}>
            Home
          </Button>
        </main>
      </div>
    )
  }

  if (data === undefined) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center p-6">
          <p className="text-muted-foreground">Loading session…</p>
        </main>
      </div>
    )
  }

  if (data === null) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="max-w-md text-muted-foreground">
            This desk session is invalid or the token does not match. Start a
            new session from the home page.
          </p>
          <Button type="button" variant="secondary" onClick={() => void navigate({ to: '/' })}>
            Home
          </Button>
        </main>
      </div>
    )
  }

  const ended = data.status === 'ended'
  const paired = data.devicePaired

  if (!paired) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-stretch gap-8 px-4 py-8 md:px-8">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight md:text-3xl">
              Desk
            </h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              session / {publicId.slice(0, 8)}…
            </p>
          </div>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>Pair phone</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="rounded-xl border-2 border-primary/40 bg-white p-4 shadow-glow-sm">
                {pairUrl ? (
                  <QRCode value={pairUrl} size={200} level="M" />
                ) : null}
              </div>
              <p className="w-full break-all text-center font-mono text-[11px] text-muted-foreground">
                {pairUrl}
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Scan the QR with your phone to pair. Only the first phone can
                join.
              </p>
            </CardContent>
          </Card>

          <div>
            <Button
              type="button"
              variant="destructive"
              disabled={ending || ended}
              onClick={() => void onEnd()}
            >
              {ending ? 'Ending…' : 'End session'}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 md:px-8">
        <section className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight md:text-3xl">
              Desk
            </h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              session / {publicId.slice(0, 8)}…
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex max-w-md cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={scanToClipboard}
                disabled={ended}
                onChange={(e) => onScanToClipboardChange(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 rounded border-border accent-primary"
              />
              <span className="text-foreground">
                <span className="font-medium">Scan to clipboard</span>
                <span className="mt-0.5 block text-muted-foreground">
                  When on, each new scan copies to the clipboard. Your browser
                  may ask for permission when you enable this.
                </span>
                {clipboardHint ? (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {clipboardHint}
                  </span>
                ) : null}
              </span>
            </label>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="destructive"
                disabled={ending || ended}
                onClick={() => void onEnd()}
              >
                {ending ? 'Ending…' : 'End session'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={!data.scans.length}
                onClick={onCopyLatest}
              >
                Copy latest
              </Button>
            </div>
          </div>
        </section>

        <section className="flex w-full flex-col gap-4">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Log
          </h2>
          <Card className="min-h-[320px] flex-1 border-border">
            <CardContent className="max-h-[min(70vh,560px)] space-y-0 overflow-y-auto p-0">
              {data.scans.length === 0 ? (
                <p className="p-5 font-mono text-sm text-muted-foreground">
                  No scans yet.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.scans.map((row) => (
                    <li
                      key={row._id}
                      className="border-l-2 border-primary px-4 py-3 font-mono text-sm"
                    >
                      <span className="block break-all text-foreground">
                        {row.value}
                      </span>
                      {row.format ? (
                        <span className="mt-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                          {row.format}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
