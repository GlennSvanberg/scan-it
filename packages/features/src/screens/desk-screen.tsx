import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { Check, Copy } from 'lucide-react'
import QRCode from 'react-qr-code'
import * as React from 'react'
import { api } from '@scan-it/convex-api'
import {
  clearDeskToken,
  cn,
  convexHttpSiteOrigin,
  getPairingOrigin,
  readDeskToken,
  saveDeskToken,
} from '@scan-it/lib'
import { SiteHeader } from '../components/site-header.tsx'
import { Button } from '../components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx'

const DEFAULT_DESKTOP_DOWNLOAD =
  'https://github.com/GlennSvanberg/scan-it/releases/latest/download/scan-it-windows-portable.zip'

export type InjectSuffix = 'none' | 'enter' | 'tab'

export type DeskInjectConfig = {
  injectScan: (text: string, suffix: InjectSuffix) => Promise<void>
}

const INJECT_ENABLED_KEY = 'scan-it-inject-enabled'
const INJECT_SUFFIX_KEY = 'scan-it-inject-suffix'

function readInjectEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(INJECT_ENABLED_KEY) === '1'
}

function writeInjectEnabled(on: boolean) {
  window.localStorage.setItem(INJECT_ENABLED_KEY, on ? '1' : '0')
}

function readInjectSuffix(): InjectSuffix {
  if (typeof window === 'undefined') return 'enter'
  const v = window.localStorage.getItem(INJECT_SUFFIX_KEY)
  if (v === 'none' || v === 'enter' || v === 'tab') return v
  return 'enter'
}

function writeInjectSuffix(s: InjectSuffix) {
  window.localStorage.setItem(INJECT_SUFFIX_KEY, s)
}

function isSameLocalCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Time only if today (local); otherwise short date + time. */
function formatScanTimestamp(createdAt: number): string {
  const d = new Date(createdAt)
  const now = new Date()
  if (isSameLocalCalendarDay(d, now)) {
    return d.toLocaleTimeString(undefined, { timeStyle: 'medium' })
  }
  return d.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'medium',
  })
}

function PairingQrBody({ pairUrl }: { pairUrl: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl border-2 border-primary/40 bg-white p-4 shadow-glow-sm">
        {pairUrl ? <QRCode value={pairUrl} size={200} level="M" /> : null}
      </div>
      <p className="w-full break-all text-center font-mono text-[11px] text-muted-foreground">
        {pairUrl}
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Scan the QR code with your phone, or open the link on the phone. Only
        one phone can connect at a time.
      </p>
    </div>
  )
}

function PairingQrCard({ pairUrl }: { pairUrl: string }) {
  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle>Connect your phone</CardTitle>
      </CardHeader>
      <CardContent>
        <PairingQrBody pairUrl={pairUrl} />
      </CardContent>
    </Card>
  )
}

export type DeskScreenProps = {
  publicId: string
  /** Desktop (Tauri): type scans into the focused application */
  inject?: DeskInjectConfig
}

export function DeskScreen({ publicId, inject }: DeskScreenProps) {
  const navigate = useNavigate()
  const [storageReady, setStorageReady] = React.useState(false)
  const [deskToken, setDeskToken] = React.useState<string | null>(null)
  const endSession = useMutation(api.scanSessions.endSession)
  const createSession = useMutation(api.scanSessions.createSession)
  const [startOverBusy, setStartOverBusy] = React.useState(false)
  const [scanToClipboard, setScanToClipboard] = React.useState(false)
  const [clipboardHint, setClipboardHint] = React.useState<string | null>(null)
  const [typeIntoApp, setTypeIntoApp] = React.useState(false)
  const [injectSuffix, setInjectSuffix] = React.useState<InjectSuffix>('enter')

  const publicIdRef = React.useRef(publicId)
  const deskTokenRef = React.useRef<string | null>(null)
  React.useEffect(() => {
    publicIdRef.current = publicId
  }, [publicId])
  React.useEffect(() => {
    deskTokenRef.current = deskToken
  }, [deskToken])

  React.useEffect(() => {
    setDeskToken(readDeskToken(publicId))
    setStorageReady(true)
    if (inject) {
      setTypeIntoApp(readInjectEnabled())
      setInjectSuffix(readInjectSuffix())
    }
  }, [publicId, inject])

  const data = useQuery(
    api.scanSessions.getDeskView,
    deskToken ? { publicId, deskToken } : 'skip',
  )

  /** Newest first (defensive: sort here so UI is correct even if query returns insertion order). */
  const scansNewestFirst = React.useMemo(() => {
    if (data === undefined || data === null) return []
    return [...data.scans].sort((a, b) => {
      const dt = b.createdAt - a.createdAt
      if (dt !== 0) return dt
      return String(b._id).localeCompare(String(a._id))
    })
  }, [data])

  const base = getPairingOrigin(
    import.meta.env as { VITE_PAIRING_ORIGIN?: string },
    typeof window !== 'undefined' ? window.location.origin : '',
  )
  const pairUrl = base ? `${base}/s/${publicId}` : ''

  const clipboardPrimed = React.useRef(false)
  const lastClipboardId = React.useRef<string | null>(null)
  const injectPrimed = React.useRef(false)
  const lastInjectId = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!deskToken || typeof window === 'undefined') return
    const convexUrl =
      (import.meta.env as { VITE_CONVEX_URL?: string }).VITE_CONVEX_URL ?? ''
    const siteOrigin = convexHttpSiteOrigin(convexUrl)
    if (!siteOrigin) return

    const onPageHide = (ev: PageTransitionEvent) => {
      if (ev.persisted) return
      const pid = publicIdRef.current
      const tok = deskTokenRef.current
      if (!tok) return
      const blob = new Blob([JSON.stringify({ publicId: pid, deskToken: tok })], {
        type: 'application/json',
      })
      void navigator.sendBeacon(`${siteOrigin}/desk/end`, blob)
    }
    window.addEventListener('pagehide', onPageHide)
    return () => window.removeEventListener('pagehide', onPageHide)
  }, [deskToken])

  React.useEffect(() => {
    if (data === undefined || data === null || !scanToClipboard) return
    const scans = scansNewestFirst
    if (scans.length === 0) {
      clipboardPrimed.current = true
      return
    }
    const latest = scans[0]
    if (!clipboardPrimed.current) {
      clipboardPrimed.current = true
      lastClipboardId.current = latest._id
      return
    }
    if (latest._id !== lastClipboardId.current) {
      lastClipboardId.current = latest._id
      void navigator.clipboard.writeText(latest.value).catch(() => {})
    }
  }, [data, scanToClipboard, scansNewestFirst])

  React.useEffect(() => {
    if (!inject || !typeIntoApp || data === undefined || data === null) return
    const scans = scansNewestFirst
    if (scans.length === 0) {
      injectPrimed.current = true
      return
    }
    const latest = scans[0]
    if (!injectPrimed.current) {
      injectPrimed.current = true
      lastInjectId.current = latest._id
      return
    }
    if (latest._id !== lastInjectId.current) {
      lastInjectId.current = latest._id
      void inject.injectScan(latest.value, injectSuffix).catch(() => {})
    }
  }, [data, inject, typeIntoApp, injectSuffix, scansNewestFirst])

  const onScanToClipboardChange = (checked: boolean) => {
    setScanToClipboard(checked)
    setClipboardHint(null)
    if (!checked) return
    if (data === undefined || data === null) return
    const scans = scansNewestFirst
    if (scans.length > 0) {
      const latest = scans[0]
      lastClipboardId.current = latest._id
      clipboardPrimed.current = true
    }
    void navigator.clipboard.writeText('\u200b').catch(() => {
      setClipboardHint(
        'If auto-copy fails, use Copy latest or wait for the next scan.',
      )
    })
  }

  const onTypeIntoAppChange = (checked: boolean) => {
    setTypeIntoApp(checked)
    writeInjectEnabled(checked)
    injectPrimed.current = false
    if (data && scansNewestFirst.length > 0) {
      lastInjectId.current = scansNewestFirst[0]._id
      injectPrimed.current = true
    }
  }

  const onInjectSuffixChange = (s: InjectSuffix) => {
    setInjectSuffix(s)
    writeInjectSuffix(s)
  }

  const onCopyLatest = () => {
    if (data === undefined || data === null) return
    const scans = scansNewestFirst
    if (scans.length === 0) return
    const latest = scans[0]
    void navigator.clipboard.writeText(latest.value)
  }

  const [copiedRowId, setCopiedRowId] = React.useState<string | null>(null)
  const copyFeedbackRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (copyFeedbackRef.current) clearTimeout(copyFeedbackRef.current)
    }
  }, [])

  const onCopyRowValue = React.useCallback((rowId: string, value: string) => {
    void navigator.clipboard.writeText(value).then(() => {
      if (copyFeedbackRef.current) clearTimeout(copyFeedbackRef.current)
      setCopiedRowId(rowId)
      copyFeedbackRef.current = setTimeout(() => {
        setCopiedRowId(null)
        copyFeedbackRef.current = null
      }, 2000)
    })
  }, [])

  const leaveToHome = React.useCallback(async () => {
    const tok = readDeskToken(publicId) ?? deskTokenRef.current
    if (tok) {
      try {
        await endSession({ publicId, deskToken: tok })
      } catch {
        /* best effort */
      }
      clearDeskToken(publicId)
    }
    await navigate({ to: '/' })
  }, [publicId, endSession, navigate])

  const onStartOver = React.useCallback(async () => {
    const tok = readDeskToken(publicId) ?? deskTokenRef.current
    if (!tok) return
    setStartOverBusy(true)
    try {
      try {
        await endSession({ publicId, deskToken: tok })
      } catch {
        /* continue */
      }
      clearDeskToken(publicId)
      const { publicId: newId, deskToken: newTok } = await createSession({})
      saveDeskToken(newId, newTok)
      await navigate({ to: '/desk/$publicId', params: { publicId: newId } })
    } finally {
      setStartOverBusy(false)
    }
  }, [publicId, endSession, createSession, navigate])

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
            This desk link is not valid for this browser. Open Scan It from this
            computer and try again.
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
        <SiteHeader onBrandClick={leaveToHome} />
        <main className="flex flex-1 items-center justify-center p-6">
          <p className="text-muted-foreground">Loading…</p>
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
            This desk is no longer available from this browser. Open Scan It from
            this computer to continue.
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
        <SiteHeader onBrandClick={leaveToHome} />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-stretch gap-8 px-4 py-8 md:px-8">
          <p className="text-sm text-muted-foreground">
            Waiting for your phone to connect. Closing this window ends the
            session.
          </p>

          <PairingQrCard pairUrl={pairUrl} />

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={startOverBusy || ended}
              onClick={() => void onStartOver()}
            >
              {startOverBusy ? 'Starting…' : 'New pairing code'}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader onBrandClick={leaveToHome} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 md:px-8">
        <p className="max-w-3xl text-sm text-muted-foreground">
          Your phone is connected. Scans appear in the log. Closing this window
          ends the session. Use{' '}
          <span className="text-foreground">Phone link &amp; QR</span> below if
          you need to open the scanner on this phone again.
        </p>

        <div className="flex min-h-0 flex-1 flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(300px,24rem)]">
          <div className="flex flex-col gap-6 lg:col-start-2 lg:row-start-1 lg:w-full">
            <details className="group rounded-xl border border-border bg-card/40 open:border-primary/25 open:shadow-glow-sm">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="underline-offset-4 group-open:underline">
                  Phone link &amp; QR
                </span>
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (reopen scanner on this phone)
                </span>
              </summary>
              <div className="border-t border-border px-4 pb-4 pt-4">
                <PairingQrBody pairUrl={pairUrl} />
              </div>
            </details>

            {!inject && !ended ? (
              <Card className="border-primary/20 bg-card/60 shadow-glow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Windows desktop app</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    In the browser you can view scans here and copy them to the
                    clipboard. The{' '}
                    <span className="font-medium text-foreground">desktop app</span>{' '}
                    can also type each new scan into{' '}
                    <span className="text-foreground">whatever program is focused</span>
                    —for example Excel or other line-of-business tools.
                  </p>
                  <Button asChild variant="outline" className="uppercase tracking-wide">
                    <a
                      href={
                        import.meta.env.VITE_DESKTOP_DOWNLOAD_URL?.trim() ||
                        DEFAULT_DESKTOP_DOWNLOAD
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download desktop app
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-start gap-3 text-sm">
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

              {inject ? (
                <div className="flex flex-col gap-2 rounded-lg border border-border/60 p-4">
                  <label className="flex cursor-pointer items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={typeIntoApp}
                      disabled={ended}
                      onChange={(e) => onTypeIntoAppChange(e.target.checked)}
                      className="mt-0.5 size-4 shrink-0 rounded border-border accent-primary"
                    />
                    <span className="text-foreground">
                      <span className="font-medium">Type into focused app</span>
                      <span className="mt-0.5 block text-muted-foreground">
                        Sends each new scan as keystrokes to whichever window is
                        focused (e.g. Excel). Click the target field first.
                      </span>
                    </span>
                  </label>
                  {typeIntoApp ? (
                    <label className="mt-1 flex flex-col gap-1 text-sm">
                      <span className="font-medium text-foreground">
                        After each scan
                      </span>
                      <select
                        value={injectSuffix}
                        disabled={ended}
                        onChange={(e) =>
                          onInjectSuffixChange(e.target.value as InjectSuffix)
                        }
                        className="rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground"
                      >
                        <option value="none">Nothing</option>
                        <option value="enter">Press Enter</option>
                        <option value="tab">Press Tab</option>
                      </select>
                    </label>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={startOverBusy || ended}
                  onClick={() => void onStartOver()}
                >
                  {startOverBusy ? 'Starting…' : 'New pairing code'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!scansNewestFirst.length}
                  onClick={onCopyLatest}
                >
                  Copy latest
                </Button>
              </div>
            </div>
          </div>

          <section className="flex min-h-0 w-full min-w-0 flex-col gap-4 lg:col-start-1 lg:row-start-1">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Log
            </h2>
            <Card className="flex min-h-[min(320px,50dvh)] flex-1 border-border lg:min-h-[min(400px,55dvh)]">
              <CardContent className="max-h-[min(70vh,560px)] flex-1 space-y-0 overflow-y-auto p-0 lg:max-h-[min(82dvh,880px)]">
                {scansNewestFirst.length === 0 ? (
                  <p className="p-5 font-mono text-sm text-muted-foreground">
                    No scans yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {scansNewestFirst.map((row) => {
                      const isLatest = row._id === scansNewestFirst[0]._id
                      return (
                      <li
                        key={row._id}
                        className={cn(
                          'flex gap-2 border-l-2 py-2 pl-3 pr-2 font-mono text-sm transition-colors sm:gap-3 sm:pl-4 sm:pr-3',
                          isLatest
                            ? 'border-primary bg-primary/10 ring-1 ring-inset ring-primary/20'
                            : 'border-primary/25 hover:bg-muted/20',
                        )}
                      >
                        <div className="min-w-0 flex-1 py-1">
                          <span className="block break-all text-foreground">
                            {row.value}
                          </span>
                          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[10px] text-muted-foreground">
                            {row.format ? (
                              <span className="uppercase tracking-wider">
                                {row.format}
                              </span>
                            ) : null}
                            {row.format ? (
                              <span aria-hidden className="text-border">
                                ·
                              </span>
                            ) : null}
                            <time
                              dateTime={new Date(row.createdAt).toISOString()}
                              className="font-mono tabular-nums tracking-normal"
                            >
                              {formatScanTimestamp(row.createdAt)}
                            </time>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={ended}
                          onClick={() => onCopyRowValue(row._id, row.value)}
                          className={cn(
                            'mt-0.5 h-8 w-8 shrink-0 rounded-md p-0 text-muted-foreground hover:bg-muted hover:text-foreground',
                            copiedRowId === row._id && 'text-primary',
                          )}
                          aria-label={
                            copiedRowId === row._id ? 'Copied' : 'Copy value'
                          }
                          title={copiedRowId === row._id ? 'Copied' : 'Copy'}
                        >
                          {copiedRowId === row._id ? (
                            <Check className="size-3.5" strokeWidth={2.5} />
                          ) : (
                            <Copy className="size-3.5" strokeWidth={2} />
                          )}
                        </Button>
                      </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}
