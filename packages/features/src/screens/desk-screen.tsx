import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { Check, Copy } from 'lucide-react'
import QRCode from 'react-qr-code'
import * as React from 'react'
import { api } from '@scan-it/convex-api'
import {
  ALL_BOOK_FIELD_IDS,
  ALL_PRODUCT_FIELD_IDS,
  allDesktopDownloadRows,
  clearDeskToken,
  cn,
  convexHttpSiteOrigin,
  detectClientDesktopKind,
  getPrimaryDesktopDownloadHref,
  primaryDesktopDownloadLabel,
  readDeskToken,
  resolveDesktopDownloadUrls,
  resolveOpenFactsEnrichmentLine,
  resolveOpenLibraryEnrichmentLine,
  resolvePairingBase,
  saveDeskToken,
} from '@scan-it/lib'
import { SiteHeader } from '../components/site-header.tsx'
import { DeskOutputSettings } from '../components/desk-output-settings.tsx'
import { Button } from '../components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx'
import type {
  BookEnrichSeparator,
  BookFieldId,
  ProductFieldId,
} from '@scan-it/lib'

export type InjectSuffix = 'none' | 'enter' | 'tab'

export type DeskInjectConfig = {
  injectScan: (text: string, suffix: InjectSuffix) => Promise<void>
  /** Types each value and sends Tab between cells (Excel). Optional; falls back to `injectScan` with a joined line. */
  injectFieldParts?: (parts: Array<string>, suffix: InjectSuffix) => Promise<void>
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

const BOOK_ENRICH_ENABLED_KEY = 'scan-it-book-enrich-enabled'
const BOOK_ENRICH_FIELDS_KEY = 'scan-it-book-enrich-fields'
const BOOK_ENRICH_SEPARATOR_KEY = 'scan-it-book-enrich-separator'
const ENRICH_MODE_KEY = 'scan-it-enrich-mode'
const ENRICH_SEPARATOR_KEY = 'scan-it-enrich-separator'
const FOOD_ENRICH_FIELDS_KEY = 'scan-it-enrich-food-fields'
const BEAUTY_ENRICH_FIELDS_KEY = 'scan-it-enrich-beauty-fields'

export type EnrichMode = 'off' | 'book' | 'food' | 'beauty'

function hasEnrichColumnsReady(
  mode: EnrichMode,
  bookCols: Array<BookFieldId>,
  foodCols: Array<ProductFieldId>,
  beautyCols: Array<ProductFieldId>,
): boolean {
  if (mode === 'off') return false
  if (mode === 'book') return bookCols.length > 0
  if (mode === 'food') return foodCols.length > 0
  return beautyCols.length > 0
}

function migrateEnrichModeIfNeeded() {
  if (typeof window === 'undefined') return
  if (window.localStorage.getItem(ENRICH_MODE_KEY)) return
  const legacyBook = window.localStorage.getItem(BOOK_ENRICH_ENABLED_KEY) === '1'
  window.localStorage.setItem(ENRICH_MODE_KEY, legacyBook ? 'book' : 'off')
}

function readEnrichMode(): EnrichMode {
  if (typeof window === 'undefined') return 'off'
  migrateEnrichModeIfNeeded()
  const m = window.localStorage.getItem(ENRICH_MODE_KEY)
  if (m === 'book' || m === 'food' || m === 'beauty' || m === 'off') return m
  return 'off'
}

function writeEnrichMode(mode: EnrichMode) {
  window.localStorage.setItem(ENRICH_MODE_KEY, mode)
  window.localStorage.setItem(BOOK_ENRICH_ENABLED_KEY, mode === 'book' ? '1' : '0')
}

function readEnrichSeparator(): BookEnrichSeparator {
  if (typeof window === 'undefined') return '\t'
  const v = window.localStorage.getItem(ENRICH_SEPARATOR_KEY)
  if (v === ',') return ','
  if (v === 'tab') return '\t'
  const legacy = window.localStorage.getItem(BOOK_ENRICH_SEPARATOR_KEY)
  return legacy === ',' ? ',' : '\t'
}

function writeEnrichSeparator(s: BookEnrichSeparator) {
  const stored = s === ',' ? ',' : 'tab'
  window.localStorage.setItem(ENRICH_SEPARATOR_KEY, stored)
  window.localStorage.setItem(BOOK_ENRICH_SEPARATOR_KEY, stored)
}

function isBookFieldId(x: string): x is BookFieldId {
  return (ALL_BOOK_FIELD_IDS as ReadonlyArray<string>).includes(x)
}

function parseBookFieldColumns(raw: string | null): Array<BookFieldId> {
  if (!raw) return [...ALL_BOOK_FIELD_IDS]
  try {
    const a = JSON.parse(raw) as unknown
    if (!Array.isArray(a)) return [...ALL_BOOK_FIELD_IDS]
    const out: Array<BookFieldId> = []
    const seen = new Set<BookFieldId>()
    for (const x of a) {
      if (typeof x === 'string' && isBookFieldId(x) && !seen.has(x)) {
        seen.add(x)
        out.push(x)
      }
    }
    return out.length > 0 ? out : [...ALL_BOOK_FIELD_IDS]
  } catch {
    return [...ALL_BOOK_FIELD_IDS]
  }
}

function readBookFieldColumns(): Array<BookFieldId> {
  if (typeof window === 'undefined') return [...ALL_BOOK_FIELD_IDS]
  return parseBookFieldColumns(window.localStorage.getItem(BOOK_ENRICH_FIELDS_KEY))
}

function writeBookFieldColumns(cols: Array<BookFieldId>) {
  window.localStorage.setItem(BOOK_ENRICH_FIELDS_KEY, JSON.stringify(cols))
}

function isProductFieldId(x: string): x is ProductFieldId {
  return (ALL_PRODUCT_FIELD_IDS as ReadonlyArray<string>).includes(x)
}

function parseProductFieldColumns(raw: string | null): Array<ProductFieldId> {
  if (!raw) return [...ALL_PRODUCT_FIELD_IDS]
  try {
    const a = JSON.parse(raw) as unknown
    if (!Array.isArray(a)) return [...ALL_PRODUCT_FIELD_IDS]
    const out: Array<ProductFieldId> = []
    const seen = new Set<ProductFieldId>()
    for (const x of a) {
      if (typeof x === 'string' && isProductFieldId(x) && !seen.has(x)) {
        seen.add(x)
        out.push(x)
      }
    }
    return out.length > 0 ? out : [...ALL_PRODUCT_FIELD_IDS]
  } catch {
    return [...ALL_PRODUCT_FIELD_IDS]
  }
}

function readFoodFieldColumns(): Array<ProductFieldId> {
  if (typeof window === 'undefined') return [...ALL_PRODUCT_FIELD_IDS]
  return parseProductFieldColumns(window.localStorage.getItem(FOOD_ENRICH_FIELDS_KEY))
}

function writeFoodFieldColumns(cols: Array<ProductFieldId>) {
  window.localStorage.setItem(FOOD_ENRICH_FIELDS_KEY, JSON.stringify(cols))
}

function readBeautyFieldColumns(): Array<ProductFieldId> {
  if (typeof window === 'undefined') return [...ALL_PRODUCT_FIELD_IDS]
  return parseProductFieldColumns(window.localStorage.getItem(BEAUTY_ENRICH_FIELDS_KEY))
}

function writeBeautyFieldColumns(cols: Array<ProductFieldId>) {
  window.localStorage.setItem(BEAUTY_ENRICH_FIELDS_KEY, JSON.stringify(cols))
}

async function resolveDeskEnrichment(
  mode: EnrichMode,
  raw: string,
  bookCols: Array<BookFieldId>,
  foodCols: Array<ProductFieldId>,
  beautyCols: Array<ProductFieldId>,
  separator: BookEnrichSeparator,
  signal?: AbortSignal,
): Promise<{ line: string; parts: Array<string>; found: boolean }> {
  if (mode === 'off') {
    return { line: raw, parts: [raw], found: true }
  }
  if (mode === 'book') {
    const r = await resolveOpenLibraryEnrichmentLine(raw, bookCols, separator, {
      signal,
    })
    return { line: r.line, parts: r.values, found: r.found }
  }
  if (mode === 'food') {
    const r = await resolveOpenFactsEnrichmentLine(raw, 'food', foodCols, separator, {
      signal,
    })
    return { line: r.line, parts: r.values, found: r.found }
  }
  const r = await resolveOpenFactsEnrichmentLine(
    raw,
    'beauty',
    beautyCols,
    separator,
    { signal },
  )
  return { line: r.line, parts: r.values, found: r.found }
}

type EnrichedScanOutput = { line: string; parts: Array<string>; found: boolean }
export type EnrichUiStatus = 'idle' | 'loading' | 'not_found' | 'error'

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
  const injectRef = React.useRef(inject)
  injectRef.current = inject

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
  const [enrichMode, setEnrichMode] = React.useState<EnrichMode>('off')
  const [bookFieldColumns, setBookFieldColumns] = React.useState<Array<BookFieldId>>(() => [
    ...ALL_BOOK_FIELD_IDS,
  ])
  const [foodFieldColumns, setFoodFieldColumns] = React.useState<Array<ProductFieldId>>(() => [
    ...ALL_PRODUCT_FIELD_IDS,
  ])
  const [beautyFieldColumns, setBeautyFieldColumns] = React.useState<Array<ProductFieldId>>(
    () => [...ALL_PRODUCT_FIELD_IDS],
  )
  const [enrichSeparator, setEnrichSeparator] =
    React.useState<BookEnrichSeparator>('\t')
  const [enrichStatus, setEnrichStatus] = React.useState<EnrichUiStatus>('idle')
  const [enrichedDataByScanId, setEnrichedDataByScanId] = React.useState<
    Record<string, { line: string; parts: Array<string> }>
  >({})

  const enrichedByScanIdRef = React.useRef(new Map<string, EnrichedScanOutput>())

  React.useEffect(() => {
    setEnrichedDataByScanId({})
  }, [publicId])

  React.useEffect(() => {
    enrichedByScanIdRef.current.clear()
    setEnrichedDataByScanId({})
  }, [enrichMode])

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
      setEnrichMode(readEnrichMode())
      setBookFieldColumns(readBookFieldColumns())
      setFoodFieldColumns(readFoodFieldColumns())
      setBeautyFieldColumns(readBeautyFieldColumns())
      setEnrichSeparator(readEnrichSeparator())
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

  const base = resolvePairingBase(
    import.meta.env as {
      VITE_PAIRING_ORIGIN?: string
      VITE_DESKTOP_PAIRING_ORIGIN?: string
    },
    typeof window !== 'undefined' ? window.location.origin : '',
    { desktopDesk: Boolean(inject) },
  )
  const pairUrl = base ? `${base}/s/${publicId}` : ''

  const desktopKind = detectClientDesktopKind()
  const desktopUrls = resolveDesktopDownloadUrls(import.meta.env)
  const desktopPrimaryHref = getPrimaryDesktopDownloadHref(
    desktopUrls,
    desktopKind,
  )
  const desktopPrimaryLabel = primaryDesktopDownloadLabel(desktopKind)
  const desktopAllRows = allDesktopDownloadRows(desktopUrls)

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
    if (data === undefined || data === null) return
    const scans = scansNewestFirst
    if (scans.length === 0) {
      clipboardPrimed.current = true
      injectPrimed.current = true
      return
    }
    const latest = scans[0]

    if (scanToClipboard) {
      if (!clipboardPrimed.current) {
        clipboardPrimed.current = true
        lastClipboardId.current = latest._id
      }
    }
    const inj = injectRef.current
    if (inj && typeIntoApp) {
      if (!injectPrimed.current) {
        injectPrimed.current = true
        lastInjectId.current = latest._id
      }
    }

    const shouldClipboard =
      scanToClipboard &&
      clipboardPrimed.current &&
      latest._id !== lastClipboardId.current
    const shouldInject =
      Boolean(inj && typeIntoApp) &&
      injectPrimed.current &&
      latest._id !== lastInjectId.current

    const useEnrich =
      Boolean(inj) &&
      hasEnrichColumnsReady(
        enrichMode,
        bookFieldColumns,
        foodFieldColumns,
        beautyFieldColumns,
      )

    if (!shouldClipboard && !shouldInject && !useEnrich) return

    const capturedId = latest._id
    const capturedRaw = latest.value
    const ac = new AbortController()

    void (async () => {
      if (useEnrich) setEnrichStatus('loading')
      let out: EnrichedScanOutput
      try {
        if (!useEnrich) {
          out = { line: capturedRaw, parts: [capturedRaw], found: true }
        } else {
          out = await resolveDeskEnrichment(
            enrichMode,
            capturedRaw,
            bookFieldColumns,
            foodFieldColumns,
            beautyFieldColumns,
            enrichSeparator,
            ac.signal,
          )
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return
        if (ac.signal.aborted) return
        out = { line: capturedRaw, parts: [capturedRaw], found: false }
        if (useEnrich) setEnrichStatus('error')
        if (shouldClipboard) lastClipboardId.current = capturedId
        if (shouldInject && inj) lastInjectId.current = capturedId
        enrichedByScanIdRef.current.set(capturedId, out)
        if (useEnrich) {
          setEnrichedDataByScanId((prev) => ({
            ...prev,
            [capturedId]: { line: out.line, parts: out.parts },
          }))
        }
        if (shouldClipboard) {
          void navigator.clipboard.writeText(out.line).catch(() => {})
        }
        if (shouldInject && inj) {
          try {
            if (
              enrichSeparator === '\t' &&
              out.parts.length > 1 &&
              inj.injectFieldParts
            ) {
              await inj.injectFieldParts(out.parts, injectSuffix)
            } else {
              await inj.injectScan(out.line, injectSuffix)
            }
          } catch {
            /* ignore */
          }
        }
        return
      }

      if (ac.signal.aborted) return

      enrichedByScanIdRef.current.set(capturedId, out)
      if (useEnrich) {
        setEnrichedDataByScanId((prev) => ({
          ...prev,
          [capturedId]: { line: out.line, parts: out.parts },
        }))
      }
      if (useEnrich) setEnrichStatus(out.found ? 'idle' : 'not_found')
      else setEnrichStatus('idle')

      if (shouldClipboard) {
        void navigator.clipboard.writeText(out.line).catch(() => {})
        lastClipboardId.current = capturedId
      }
      if (shouldInject && inj) {
        try {
          if (
            enrichSeparator === '\t' &&
            out.parts.length > 1 &&
            inj.injectFieldParts
          ) {
            await inj.injectFieldParts(out.parts, injectSuffix)
          } else {
            await inj.injectScan(out.line, injectSuffix)
          }
        } catch {
          /* ignore */
        }
        lastInjectId.current = capturedId
      }
    })()

    return () => ac.abort()
  }, [
    data,
    scansNewestFirst,
    scanToClipboard,
    typeIntoApp,
    injectSuffix,
    enrichMode,
    bookFieldColumns,
    foodFieldColumns,
    beautyFieldColumns,
    enrichSeparator,
  ])

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

  const onEnrichModeChange = (mode: EnrichMode) => {
    setEnrichMode(mode)
    writeEnrichMode(mode)
    setEnrichStatus('idle')
  }

  const onEnrichSeparatorChange = (s: BookEnrichSeparator) => {
    setEnrichSeparator(s)
    writeEnrichSeparator(s)
  }

  const moveBookField = React.useCallback((index: number, dir: -1 | 1) => {
    setBookFieldColumns((prev) => {
      const j = index + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[j]] = [next[j], next[index]]
      writeBookFieldColumns(next)
      return next
    })
  }, [])

  const removeBookField = React.useCallback((id: BookFieldId) => {
    setBookFieldColumns((prev) => {
      if (prev.length <= 1) return prev
      const next = prev.filter((x) => x !== id)
      const saved: Array<BookFieldId> =
        next.length > 0 ? next : ['scannedCode']
      writeBookFieldColumns(saved)
      return saved
    })
  }, [])

  const addBookField = React.useCallback((id: BookFieldId) => {
    setBookFieldColumns((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      writeBookFieldColumns(next)
      return next
    })
  }, [])

  const moveFoodField = React.useCallback((index: number, dir: -1 | 1) => {
    setFoodFieldColumns((prev) => {
      const j = index + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[j]] = [next[j], next[index]]
      writeFoodFieldColumns(next)
      return next
    })
  }, [])

  const removeFoodField = React.useCallback((id: ProductFieldId) => {
    setFoodFieldColumns((prev) => {
      if (prev.length <= 1) return prev
      const next = prev.filter((x) => x !== id)
      const saved: Array<ProductFieldId> =
        next.length > 0 ? next : ['scannedCode']
      writeFoodFieldColumns(saved)
      return saved
    })
  }, [])

  const addFoodField = React.useCallback((id: ProductFieldId) => {
    setFoodFieldColumns((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      writeFoodFieldColumns(next)
      return next
    })
  }, [])

  const moveBeautyField = React.useCallback((index: number, dir: -1 | 1) => {
    setBeautyFieldColumns((prev) => {
      const j = index + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[j]] = [next[j], next[index]]
      writeBeautyFieldColumns(next)
      return next
    })
  }, [])

  const removeBeautyField = React.useCallback((id: ProductFieldId) => {
    setBeautyFieldColumns((prev) => {
      if (prev.length <= 1) return prev
      const next = prev.filter((x) => x !== id)
      const saved: Array<ProductFieldId> =
        next.length > 0 ? next : ['scannedCode']
      writeBeautyFieldColumns(saved)
      return saved
    })
  }, [])

  const addBeautyField = React.useCallback((id: ProductFieldId) => {
    setBeautyFieldColumns((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      writeBeautyFieldColumns(next)
      return next
    })
  }, [])

  const bookFieldsAvailableToAdd = React.useMemo(
    () => ALL_BOOK_FIELD_IDS.filter((id) => !bookFieldColumns.includes(id)),
    [bookFieldColumns],
  )

  const foodFieldsAvailableToAdd = React.useMemo(
    () => ALL_PRODUCT_FIELD_IDS.filter((id) => !foodFieldColumns.includes(id)),
    [foodFieldColumns],
  )

  const beautyFieldsAvailableToAdd = React.useMemo(
    () => ALL_PRODUCT_FIELD_IDS.filter((id) => !beautyFieldColumns.includes(id)),
    [beautyFieldColumns],
  )

  const onCopyLatest = React.useCallback(() => {
    if (data === undefined || data === null) return
    const scans = scansNewestFirst
    if (scans.length === 0) return
    const latest = scans[0]
    const cached = enrichedByScanIdRef.current.get(latest._id)
    if (cached) {
      void navigator.clipboard.writeText(cached.line)
      return
    }
    const enrichActive =
      Boolean(inject) &&
      hasEnrichColumnsReady(
        enrichMode,
        bookFieldColumns,
        foodFieldColumns,
        beautyFieldColumns,
      )
    if (!enrichActive) {
      void navigator.clipboard.writeText(latest.value)
      return
    }
    void (async () => {
      try {
        const out = await resolveDeskEnrichment(
          enrichMode,
          latest.value,
          bookFieldColumns,
          foodFieldColumns,
          beautyFieldColumns,
          enrichSeparator,
        )
        enrichedByScanIdRef.current.set(latest._id, out)
        void navigator.clipboard.writeText(out.line)
      } catch {
        void navigator.clipboard.writeText(latest.value)
      }
    })()
  }, [
    data,
    scansNewestFirst,
    inject,
    enrichMode,
    bookFieldColumns,
    foodFieldColumns,
    beautyFieldColumns,
    enrichSeparator,
  ])

  const [copiedRowId, setCopiedRowId] = React.useState<string | null>(null)
  const copyFeedbackRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (copyFeedbackRef.current) clearTimeout(copyFeedbackRef.current)
    }
  }, [])

  const showCopyFeedback = React.useCallback((rowId: string) => {
    if (copyFeedbackRef.current) clearTimeout(copyFeedbackRef.current)
    setCopiedRowId(rowId)
    copyFeedbackRef.current = setTimeout(() => {
      setCopiedRowId(null)
      copyFeedbackRef.current = null
    }, 2000)
  }, [])

  const onCopyRowValue = React.useCallback(
    (rowId: string, value: string) => {
      const finish = (text: string) => {
        void navigator.clipboard.writeText(text).then(() => {
          showCopyFeedback(rowId)
        })
      }
      const cached = enrichedByScanIdRef.current.get(rowId)
      if (cached) {
        finish(cached.line)
        return
      }
      const enrichActive =
        Boolean(inject) &&
        hasEnrichColumnsReady(
          enrichMode,
          bookFieldColumns,
          foodFieldColumns,
          beautyFieldColumns,
        )
      if (!enrichActive) {
        finish(value)
        return
      }
      void (async () => {
        try {
          const out = await resolveDeskEnrichment(
            enrichMode,
            value,
            bookFieldColumns,
            foodFieldColumns,
            beautyFieldColumns,
            enrichSeparator,
          )
          enrichedByScanIdRef.current.set(rowId, out)
          finish(out.line)
        } catch {
          finish(value)
        }
      })()
    },
    [
      inject,
      enrichMode,
      bookFieldColumns,
      foodFieldColumns,
      beautyFieldColumns,
      enrichSeparator,
      showCopyFeedback,
    ],
  )

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

  const enrichHasMultipleColumns =
    enrichMode === 'book'
      ? bookFieldColumns.length > 1
      : enrichMode === 'food'
        ? foodFieldColumns.length > 1
        : enrichMode === 'beauty'
          ? beautyFieldColumns.length > 1
          : false

  if (!paired) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader onBrandClick={leaveToHome} />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-stretch gap-8 px-4 py-8 md:px-8">
          <p className="text-sm text-muted-foreground">
            Waiting for your phone to connect. Closing this window disconnects
            your phone.
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
          disconnects your phone. Use{' '}
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

            <div className="flex flex-col gap-3">
              <DeskOutputSettings
                ended={ended}
                scanToClipboard={scanToClipboard}
                onScanToClipboardChange={onScanToClipboardChange}
                clipboardHint={clipboardHint}
                inject={inject}
                typeIntoApp={typeIntoApp}
                onTypeIntoAppChange={onTypeIntoAppChange}
                injectSuffix={injectSuffix}
                onInjectSuffixChange={onInjectSuffixChange}
                enrichMode={enrichMode}
                onEnrichModeChange={onEnrichModeChange}
                enrichSeparator={enrichSeparator}
                onEnrichSeparatorChange={onEnrichSeparatorChange}
                enrichHasMultipleColumns={enrichHasMultipleColumns}
                bookFieldColumns={bookFieldColumns}
                bookFieldsAvailableToAdd={bookFieldsAvailableToAdd}
                moveBookField={moveBookField}
                removeBookField={removeBookField}
                addBookField={addBookField}
                foodFieldColumns={foodFieldColumns}
                foodFieldsAvailableToAdd={foodFieldsAvailableToAdd}
                moveFoodField={moveFoodField}
                removeFoodField={removeFoodField}
                addFoodField={addFoodField}
                beautyFieldColumns={beautyFieldColumns}
                beautyFieldsAvailableToAdd={beautyFieldsAvailableToAdd}
                moveBeautyField={moveBeautyField}
                removeBeautyField={removeBeautyField}
                addBeautyField={addBeautyField}
                enrichStatus={enrichStatus}
                latestScanEnriched={
                  scansNewestFirst.length > 0
                    ? enrichedDataByScanId[scansNewestFirst[0]._id] ?? null
                    : null
                }
              />

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
                      const enrichLogLine =
                        inject && enrichMode !== 'off'
                          ? Object.hasOwn(enrichedDataByScanId, row._id)
                            ? enrichedDataByScanId[row._id].line
                            : null
                          : null
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
                          {enrichLogLine !== null ? (
                            <>
                              <span className="block break-all text-foreground">
                                {enrichLogLine}
                              </span>
                              {enrichLogLine !== row.value ? (
                                <span className="mt-1 block break-all text-[11px] text-muted-foreground">
                                  Raw scan: {row.value}
                                </span>
                              ) : null}
                            </>
                          ) : (
                            <span className="block break-all text-foreground">
                              {row.value}
                            </span>
                          )}
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
                            {enrichLogLine !== null && enrichLogLine !== row.value ? (
                              <>
                                <span className="rounded-sm bg-primary/10 px-1 py-0.5 font-medium text-primary">
                                  Enriched
                                </span>
                                <span aria-hidden className="text-border">
                                  ·
                                </span>
                              </>
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

          {!inject && !ended ? (
            <Card className="border-primary/20 bg-card/60 shadow-glow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Desktop app (Windows &amp; Mac)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  In the browser you can view scans here and copy them to the
                  clipboard. The{' '}
                  <span className="font-medium text-foreground">desktop app</span>{' '}
                  can also type each new scan into{' '}
                  <span className="text-foreground">whatever program is focused</span>
                  —for example Excel or other line-of-business tools—and can
                  automatically fill in product or book details from public databases. On macOS you
                  may need to grant Accessibility permission for keystrokes.
                </p>
                <div className="flex flex-col gap-2">
                  <Button asChild variant="outline" className="uppercase tracking-wide">
                    <a
                      href={desktopPrimaryHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {desktopPrimaryLabel}
                    </a>
                  </Button>
                  <details className="rounded-md border border-border/60 bg-background/40 px-3 py-2">
                    <summary className="cursor-pointer text-xs font-medium text-foreground">
                      All downloads
                    </summary>
                    <ul className="mt-2 space-y-1.5 list-none pl-0 text-xs">
                      {desktopAllRows.map((row) => (
                        <li key={row.href}>
                          <a
                            href={row.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline-offset-2 hover:underline"
                          >
                            {row.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
    </div>
  )
}
