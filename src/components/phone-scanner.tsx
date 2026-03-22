import { useMutation } from 'convex/react'
import * as React from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { api } from '../../convex/_generated/api'
import type { Html5QrcodeCameraScanConfig } from 'html5-qrcode'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { cn } from '~/lib/utils'

type Props = {
  publicId: string
  deviceId: string
}

const SCANNER_FPS = 14
const DEDUP_MS = 1500
const RESIZE_DEBOUNCE_MS = 350
const RESIZE_THRESHOLD = 0.12

const SUPPORTED_FORMATS: Array<Html5QrcodeSupportedFormats> = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.CODE_93,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.CODABAR,
  Html5QrcodeSupportedFormats.DATA_MATRIX,
  Html5QrcodeSupportedFormats.PDF_417,
  Html5QrcodeSupportedFormats.AZTEC,
]

function pendingQueueKey(publicId: string, deviceId: string): string {
  return `scan-it:pending-scans:${publicId}:${deviceId}`
}

type PendingScan = { value: string; format?: string }

function readPendingQueue(key: string): Array<PendingScan> {
  if (typeof sessionStorage === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is PendingScan =>
        x !== null &&
        typeof x === 'object' &&
        typeof (x as PendingScan).value === 'string',
    )
  } catch {
    return []
  }
}

function writePendingQueue(key: string, items: Array<PendingScan>) {
  try {
    sessionStorage.setItem(key, JSON.stringify(items))
  } catch {
    // quota or private mode — queue lives in memory only via state if needed
  }
}

function normalizeDecodedText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

async function tryLockPortrait(): Promise<void> {
  try {
    const o = screen.orientation as ScreenOrientation & {
      lock?: (orientation: string) => Promise<void>
    }
    await o.lock?.('portrait')
  } catch {
    // Fullscreen / policy — ignore
  }
}

function unlockOrientationSafe(): void {
  try {
    screen.orientation.unlock()
  } catch {
    // ignore
  }
}

function playScanBeep(ctxRef: React.MutableRefObject<AudioContext | null>) {
  if (typeof window === 'undefined') return
  try {
    const g = globalThis as unknown as {
      AudioContext?: typeof AudioContext
      webkitAudioContext?: typeof AudioContext
    }
    const Ctor = g.AudioContext ?? g.webkitAudioContext
    if (Ctor === undefined) return

    let ctx: AudioContext
    if (ctxRef.current !== null && ctxRef.current.state !== 'closed') {
      ctx = ctxRef.current
    } else {
      ctx = new Ctor()
      ctxRef.current = ctx
    }

    void ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(920, ctx.currentTime)
    osc.type = 'sine'
    const t0 = ctx.currentTime
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.linearRampToValueAtTime(0.12, t0 + 0.015)
    gain.gain.linearRampToValueAtTime(0.0001, t0 + 0.12)
    osc.start(t0)
    osc.stop(t0 + 0.13)
  } catch {
    // Autoplay policy or unsupported — ignore
  }
}

function vibrateOnScan(reducedMotion: boolean) {
  try {
    navigator.vibrate(0)
    if (reducedMotion) {
      navigator.vibrate(80)
    } else {
      navigator.vibrate([320, 90, 280])
    }
  } catch {
    // ignore
  }
}

function cancelVibration() {
  try {
    navigator.vibrate(0)
  } catch {
    // ignore
  }
}

function cameraStartErrorMessage(error: unknown): string {
  if (typeof error === 'string' && error.length > 0) {
    return error
  }
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') {
      return 'Camera access was blocked. Allow camera in your browser settings and try again.'
    }
    if (error.name === 'NotFoundError') {
      return 'No camera was found on this device.'
    }
    if (error.name === 'NotReadableError') {
      return 'Camera is in use by another app or could not be opened.'
    }
    if (error.name === 'SecurityError') {
      return 'Camera requires a secure (HTTPS) connection.'
    }
    return error.message || 'Camera could not be started.'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Camera failed to start. Check permissions and try again.'
}

/**
 * html5-qrcode only allows a single-key object here (`facingMode` or `deviceId`).
 * Extra keys (width/height) must go in `Html5QrcodeCameraScanConfig.videoConstraints`.
 */
function cameraIdArg(facing: 'environment' | 'user'): { facingMode: 'environment' | 'user' } {
  return { facingMode: facing }
}

function advancedVideoConstraints(
  facing: 'environment' | 'user',
  tier: 'high' | 'mid',
): MediaTrackConstraints {
  const facingMode =
    facing === 'environment'
      ? { ideal: 'environment' as const }
      : { ideal: 'user' as const }
  if (tier === 'high') {
    return {
      facingMode,
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    }
  }
  return {
    facingMode,
    width: { ideal: 1280 },
    height: { ideal: 720 },
  }
}

export function PhoneScanner({ publicId, deviceId }: Props) {
  const submitScanMutation = useMutation(api.scanSessions.submitScan)
  const submitScanRef = React.useRef(submitScanMutation)
  submitScanRef.current = submitScanMutation

  const regionId = 'phone-scanner-region'
  const containerRef = React.useRef<HTMLDivElement>(null)
  const html5Ref = React.useRef<Html5Qrcode | null>(null)
  const lastDecodeRef = React.useRef<{
    value: string
    format?: string
    at: number
  } | null>(null)
  const audioCtxRef = React.useRef<AudioContext | null>(null)
  const wakeLockRef = React.useRef<WakeLockSentinel | null>(null)
  const scanningActiveRef = React.useRef(false)
  const reducedMotionRef = React.useRef(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)
  const flushQueueInFlightRef = React.useRef(false)
  const resizeWidthRef = React.useRef(0)
  const resizeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

  const queueKey = pendingQueueKey(publicId, deviceId)

  const [cameraPhase, setCameraPhase] = React.useState<
    'off' | 'starting' | 'running' | 'error'
  >('off')
  const [facingMode, setFacingMode] = React.useState<'environment' | 'user'>(
    'environment',
  )
  /** True when the browser reports torch support; false when it reports no torch. */
  const [torchCapability, setTorchCapability] = React.useState<
    boolean | 'unknown'
  >('unknown')
  const [torchOn, setTorchOn] = React.useState(false)
  const [queuedCount, setQueuedCount] = React.useState(0)
  const [lastFailedSubmit, setLastFailedSubmit] =
    React.useState<PendingScan | null>(null)
  const [cameraError, setCameraError] = React.useState<string | null>(null)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [sendingQueued, setSendingQueued] = React.useState(false)
  const [scanFlash, setScanFlash] = React.useState(false)
  const [scanPreview, setScanPreview] = React.useState<{
    value: string
    key: number
  } | null>(null)
  const previewClearRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

  const refreshQueuedCount = React.useCallback(() => {
    setQueuedCount(readPendingQueue(queueKey).length)
  }, [queueKey])

  React.useEffect(() => {
    refreshQueuedCount()
  }, [refreshQueuedCount])

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      const v = mq.matches
      reducedMotionRef.current = v
      setPrefersReducedMotion(v)
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  React.useEffect(() => {
    return () => {
      if (previewClearRef.current !== null) {
        clearTimeout(previewClearRef.current)
      }
    }
  }, [])

  const runScanFeedback = React.useCallback((scannedValue: string) => {
    if (!reducedMotionRef.current) {
      playScanBeep(audioCtxRef)
      setScanFlash(true)
    } else {
      playScanBeep(audioCtxRef)
    }
    if (previewClearRef.current !== null) {
      clearTimeout(previewClearRef.current)
    }
    setScanPreview({ value: scannedValue, key: Date.now() })
    previewClearRef.current = setTimeout(() => {
      setScanPreview(null)
      previewClearRef.current = null
    }, 2000)
  }, [])

  const releaseWakeLock = React.useCallback(async () => {
    try {
      await wakeLockRef.current?.release()
    } catch {
      // ignore
    }
    wakeLockRef.current = null
  }, [])

  const requestWakeLock = React.useCallback(async () => {
    if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') {
      return
    }
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
    } catch {
      // ignore
    }
  }, [])

  const flushPendingQueue = React.useCallback(async () => {
    if (flushQueueInFlightRef.current) return
    const pending = readPendingQueue(queueKey)
    if (pending.length === 0) return
    flushQueueInFlightRef.current = true
    setSendingQueued(true)
    try {
      const remaining: Array<PendingScan> = []
      let index = 0
      for (const item of pending) {
        try {
          await submitScanRef.current({
            publicId,
            deviceId,
            value: item.value,
            format: item.format,
          })
        } catch {
          remaining.push(...pending.slice(index))
          break
        }
        index += 1
      }
      writePendingQueue(queueKey, remaining)
      setQueuedCount(remaining.length)
    } finally {
      flushQueueInFlightRef.current = false
      setSendingQueued(false)
    }
  }, [publicId, deviceId, queueKey])

  React.useEffect(() => {
    void flushPendingQueue()
  }, [flushPendingQueue])

  const appendToQueue = React.useCallback(
    (item: PendingScan) => {
      const q = readPendingQueue(queueKey)
      q.push(item)
      writePendingQueue(queueKey, q)
      setQueuedCount(q.length)
    },
    [queueKey],
  )

  const processDecoded = React.useCallback(
    async (rawText: string, format?: string) => {
      const text = normalizeDecodedText(rawText)
      if (!text) return

      const now = Date.now()
      const last = lastDecodeRef.current
      if (
        last &&
        last.value === text &&
        last.format === format &&
        now - last.at < DEDUP_MS
      ) {
        return
      }
      lastDecodeRef.current = { value: text, format, at: now }

      vibrateOnScan(reducedMotionRef.current)

      try {
        await submitScanRef.current({
          publicId,
          deviceId,
          value: text,
          format: format || undefined,
        })
        setSubmitError(null)
        setLastFailedSubmit(null)
        cancelVibration()
        runScanFeedback(text)
        void flushPendingQueue()
      } catch (e) {
        cancelVibration()
        lastDecodeRef.current = null
        const msg = e instanceof Error ? e.message : 'Could not send scan'
        setSubmitError(msg)
        setLastFailedSubmit({ value: text, format })
        appendToQueue({ value: text, format })
      }
    },
    [appendToQueue, deviceId, flushPendingQueue, publicId, runScanFeedback],
  )

  const decodeHandlerRef = React.useRef(processDecoded)
  decodeHandlerRef.current = processDecoded

  const stopCamera = React.useCallback(async () => {
    scanningActiveRef.current = false
    setTorchCapability('unknown')
    setTorchOn(false)
    await releaseWakeLock()
    const h = html5Ref.current
    if (h?.isScanning) {
      try {
        await h.stop()
      } catch {
        // ignore
      }
    }
    unlockOrientationSafe()
    setCameraPhase('off')
    setCameraError(null)
  }, [releaseWakeLock])

  const startCameraPipeline = React.useCallback(
    async (opts?: {
      skipOrientationLock?: boolean
      facingOverride?: 'environment' | 'user'
    }) => {
      const face = opts?.facingOverride ?? facingMode
      if (!opts?.skipOrientationLock) {
        await tryLockPortrait()
      }

      setCameraPhase('starting')
      setCameraError(null)
      setTorchOn(false)
      setTorchCapability('unknown')

      let html5 = html5Ref.current
      if (html5 === null) {
        html5 = new Html5Qrcode(regionId, {
          verbose: false,
          formatsToSupport: SUPPORTED_FORMATS,
          useBarCodeDetectorIfSupported: true,
        })
        html5Ref.current = html5
      }

      if (html5.isScanning) {
        try {
          await html5.stop()
        } catch {
          // ignore
        }
      }

      const qrbox: Html5QrcodeCameraScanConfig['qrbox'] = (
        viewfinderWidth,
        viewfinderHeight,
      ) => {
        const el = containerRef.current
        const w = el?.clientWidth ?? viewfinderWidth
        const cap = Math.max(Math.min(viewfinderWidth, viewfinderHeight), 1)
        const raw = Math.round(
          Math.min(Math.max(w * 0.88, 140), cap * 0.92, 340),
        )
        const side = Math.min(Math.max(raw, 50), cap)
        return { width: side, height: side }
      }

      const tiers: Array<'high' | 'mid' | 'low'> = ['high', 'mid', 'low']
      let lastErr: unknown = null
      let started = false

      for (const tier of tiers) {
        const scanConfig: Html5QrcodeCameraScanConfig = {
          fps: SCANNER_FPS,
          qrbox,
          ...(tier === 'low'
            ? {}
            : { videoConstraints: advancedVideoConstraints(face, tier) }),
        }
        try {
          await html5.start(
            cameraIdArg(face),
            scanConfig,
            (decodedText, decodedResult) => {
              const fmt = decodedResult.result.format?.formatName
              void decodeHandlerRef.current(decodedText, fmt ?? undefined)
            },
            () => {},
          )
          started = true
          break
        } catch (e) {
          lastErr = e
          if (
            e instanceof DOMException &&
            e.name === 'OverconstrainedError' &&
            tier !== 'low'
          ) {
            continue
          }
          break
        }
      }

      if (!started) {
        scanningActiveRef.current = false
        setCameraError(cameraStartErrorMessage(lastErr))
        setCameraPhase('error')
        return
      }

      scanningActiveRef.current = true
      setCameraPhase('running')
      resizeWidthRef.current = containerRef.current?.clientWidth ?? 0

      try {
        const caps = html5.getRunningTrackCapabilities() as MediaTrackCapabilities & {
          torch?: boolean
        }
        if (caps.torch === true) {
          setTorchCapability(true)
        } else if (caps.torch === false) {
          setTorchCapability(false)
        } else {
          setTorchCapability('unknown')
        }
      } catch {
        setTorchCapability('unknown')
      }

      void requestWakeLock()
    },
    [facingMode, requestWakeLock],
  )

  const startPipelineRef = React.useRef(startCameraPipeline)
  startPipelineRef.current = startCameraPipeline

  React.useEffect(() => {
    const onVis = () => {
      const h = html5Ref.current
      if (h === null || !h.isScanning) return
      if (document.visibilityState === 'hidden') {
        h.pause(true)
        void releaseWakeLock()
      } else {
        h.resume()
        void requestWakeLock()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [releaseWakeLock, requestWakeLock])

  React.useEffect(() => {
    const portraitMq = window.matchMedia('(orientation: portrait)')

    const onResize = () => {
      if (!scanningActiveRef.current) return
      if (resizeTimerRef.current !== null) {
        clearTimeout(resizeTimerRef.current)
      }
      resizeTimerRef.current = setTimeout(() => {
        // Rotation swaps width/height and used to stop+restart the camera, killing the
        // stream. Only adjust layout when still in portrait; in landscape keep scanning.
        if (!portraitMq.matches) {
          return
        }
        const w = containerRef.current?.clientWidth ?? 0
        const last = resizeWidthRef.current
        if (
          w > 0 &&
          last > 0 &&
          Math.abs(w - last) / last > RESIZE_THRESHOLD
        ) {
          resizeWidthRef.current = w
          void (async () => {
            const h = html5Ref.current
            if (h?.isScanning) {
              await h.stop().catch(() => {})
            }
            await startPipelineRef.current({ skipOrientationLock: true })
          })()
        }
      }, RESIZE_DEBOUNCE_MS)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (resizeTimerRef.current !== null) {
        clearTimeout(resizeTimerRef.current)
        resizeTimerRef.current = null
      }
    }
  }, [])

  React.useEffect(() => {
    const onOnline = () => {
      void flushPendingQueue()
    }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [flushPendingQueue])

  React.useEffect(() => {
    return () => {
      void (async () => {
        scanningActiveRef.current = false
        await releaseWakeLock()
        unlockOrientationSafe()
        const h = html5Ref.current
        if (h?.isScanning) {
          await h.stop().catch(() => {})
        }
      })()
    }
  }, [releaseWakeLock])

  const onStartCamera = () => {
    void startCameraPipeline()
  }

  const onRetryCamera = () => {
    void startCameraPipeline()
  }

  const onStopCamera = () => {
    void stopCamera()
  }

  const onFlipCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
    void (async () => {
      const h = html5Ref.current
      if (h?.isScanning) {
        try {
          await h.stop()
        } catch {
          // ignore
        }
      }
      await startCameraPipeline({
        skipOrientationLock: true,
        facingOverride: next,
      })
    })()
  }

  const onToggleTorch = () => {
    const h = html5Ref.current
    if (h === null || !h.isScanning) return
    const next = !torchOn
    void (async () => {
      try {
        await h.applyVideoConstraints({
          advanced: [{ torch: next } as MediaTrackConstraintSet],
        } as MediaTrackConstraints)
        setTorchOn(next)
      } catch {
        // Unsupported or busy — leave torch off; user can retry
      }
    })()
  }

  const showFlashlightToggle =
    facingMode === 'environment' && torchCapability !== false

  const onRetrySend = () => {
    if (lastFailedSubmit === null) return
    void (async () => {
      try {
        await submitScanRef.current({
          publicId,
          deviceId,
          value: lastFailedSubmit.value,
          format: lastFailedSubmit.format,
        })
        setSubmitError(null)
        setLastFailedSubmit(null)
        void flushPendingQueue()
      } catch (e) {
        setSubmitError(e instanceof Error ? e.message : 'Could not send scan')
      }
    })()
  }

  return (
    <Card className="overflow-hidden border-primary/30">
      <CardHeader>
        <CardTitle>Scanner</CardTitle>
        <p className="font-mono text-xs text-muted-foreground">
          Point at barcodes or QR codes. Results appear on your computer.
        </p>
      </CardHeader>
      <CardContent className="space-y-3 p-0">
        {(queuedCount > 0 || sendingQueued) && (
          <p className="border-l-2 border-amber-500/80 bg-amber-500/5 px-5 py-2 text-sm text-amber-900 dark:text-amber-100">
            {sendingQueued
              ? 'Sending queued scans…'
              : `Queued offline: ${queuedCount} — will send when you are back online.`}
          </p>
        )}
        <div className="relative bg-black/80 px-2 pb-4 pt-2">
          <div
            ref={containerRef}
            className={cn(
              'relative mx-auto w-full max-w-sm rounded-lg',
              scanFlash && !prefersReducedMotion && 'scanner-success-flash',
            )}
            onAnimationEnd={(e) => {
              if (e.target !== e.currentTarget) return
              if (e.animationName === 'scanner-success-ring') {
                setScanFlash(false)
              }
            }}
          >
            <div
              className="scanner-frame mx-auto aspect-square w-full overflow-hidden rounded-lg"
              id={regionId}
            />
            {scanPreview ? (
              <div
                className="pointer-events-none absolute inset-x-1 bottom-1 z-[3] rounded-md border border-white/15 bg-black/80 px-2 py-1.5 shadow-lg backdrop-blur-sm"
                key={scanPreview.key}
              >
                <p className="text-[10px] font-medium uppercase tracking-wide text-white/60">
                  Scanned
                </p>
                <p className="mt-0.5 max-h-24 overflow-y-auto break-all font-mono text-sm leading-snug text-white">
                  {scanPreview.value}
                </p>
              </div>
            ) : null}
          </div>
          {cameraPhase === 'starting' && (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
              Starting camera…
            </p>
          )}
          {cameraPhase === 'off' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 px-4">
              <Button type="button" onClick={onStartCamera} size="lg">
                Start camera
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 px-5 pb-2">
          {cameraPhase === 'running' && (
            <>
              <Button type="button" variant="secondary" onClick={onStopCamera}>
                Stop camera
              </Button>
              <Button type="button" variant="outline" onClick={onFlipCamera}>
                {facingMode === 'environment'
                  ? 'Use front camera'
                  : 'Use back camera'}
              </Button>
              {showFlashlightToggle ? (
                <Button
                  type="button"
                  variant={torchOn ? 'default' : 'outline'}
                  onClick={onToggleTorch}
                  title={
                    torchCapability === 'unknown'
                      ? 'Turn the phone flashlight on or off (if supported)'
                      : undefined
                  }
                >
                  {torchOn ? 'Flashlight on' : 'Flashlight'}
                </Button>
              ) : null}
            </>
          )}
          {cameraPhase === 'error' && (
            <Button type="button" onClick={onRetryCamera}>
              Retry camera
            </Button>
          )}
        </div>

        {cameraError ? (
          <p className="border-l-2 border-destructive px-5 py-2 text-sm text-destructive">
            {cameraError}
          </p>
        ) : null}

        {submitError ? (
          <div className="space-y-2 border-l-2 border-destructive px-5 py-2">
            <p className="text-sm text-destructive">{submitError}</p>
            {lastFailedSubmit !== null ? (
              <Button type="button" size="sm" variant="outline" onClick={onRetrySend}>
                Retry send
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
