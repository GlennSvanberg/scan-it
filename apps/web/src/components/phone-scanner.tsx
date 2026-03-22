import { useMutation } from 'convex/react'
import * as React from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { api } from '@scan-it/convex-api'
import { Button } from '@scan-it/features'
import { cn } from '@scan-it/lib'
import type { Html5QrcodeCameraScanConfig } from 'html5-qrcode'

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
  opts?: { exactDeviceId?: string | null },
): MediaTrackConstraints {
  const facingMode =
    facing === 'environment'
      ? { ideal: 'environment' as const }
      : { ideal: 'user' as const }
  const id = opts?.exactDeviceId
  const deviceId =
    typeof id === 'string' && id.length > 0 ? { exact: id } : undefined

  if (tier === 'high') {
    return {
      ...(deviceId !== undefined ? { deviceId } : {}),
      facingMode,
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    }
  }
  return {
    ...(deviceId !== undefined ? { deviceId } : {}),
    facingMode,
    width: { ideal: 1280 },
    height: { ideal: 720 },
  }
}

function isLikelyFrontCameraLabel(label: string): boolean {
  return /front|user|selfie|face\s*time|facetime|iris|true\s*depth|depth|dot\s*projection/i.test(
    label.toLowerCase(),
  )
}

function isLikelyBackCameraLabel(label: string): boolean {
  return /back|rear|environment|wide|ultra|tele|macro|lid(l|a)r|0x/i.test(
    label.toLowerCase(),
  )
}

/**
 * Many phones expose several lenses as separate videoinputs. `facingMode:
 * environment` often picks a wide/auxiliary camera with no LED torch.
 * We probe for a device that reports `torch` in track capabilities, then fall
 * back to the last non–front-facing device (common “main” back camera).
 */
async function resolveEnvironmentCameraDeviceId(): Promise<string | null> {
  if (typeof navigator === 'undefined') {
    return null
  }
  // Insecure contexts / older WebViews omit `mediaDevices` despite lib.dom types.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime guard
  if (navigator.mediaDevices === undefined) {
    return null
  }
  const md = navigator.mediaDevices

  let warm: MediaStream | null = null
  try {
    warm = await md.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    })
  } catch {
    return null
  } finally {
    if (warm !== null) {
      warm.getTracks().forEach((t) => t.stop())
    }
  }

  const raw = await md.enumerateDevices()
  const inputs = raw.filter(
    (d): d is MediaDeviceInfo & { deviceId: string } =>
      d.kind === 'videoinput' && Boolean(d.deviceId),
  )
  if (inputs.length === 0) {
    return null
  }

  const ranked = [...inputs].sort((a, b) => {
    const fa = isLikelyFrontCameraLabel(a.label) ? 0 : 1
    const fb = isLikelyFrontCameraLabel(b.label) ? 0 : 1
    if (fa !== fb) {
      return fb - fa
    }
    const ba = isLikelyBackCameraLabel(a.label) ? 1 : 0
    const bb = isLikelyBackCameraLabel(b.label) ? 1 : 0
    if (ba !== bb) {
      return bb - ba
    }
    return 0
  })

  for (const d of ranked) {
    if (isLikelyFrontCameraLabel(d.label)) {
      continue
    }

    let stream: MediaStream | null = null
    try {
      stream = await md.getUserMedia({
        video: { deviceId: { exact: d.deviceId } },
        audio: false,
      })
      const track = stream.getVideoTracks()[0]
      const caps = track.getCapabilities() as MediaTrackCapabilities & {
        torch?: boolean
      }
      if (caps.torch === true) {
        return d.deviceId
      }
    } catch {
      // Device in use or gone — try next.
    } finally {
      if (stream !== null) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }

  const nonFront = inputs.filter((d) => !isLikelyFrontCameraLabel(d.label))
  if (nonFront.length > 0) {
    return nonFront[nonFront.length - 1].deviceId
  }
  return inputs[inputs.length - 1].deviceId
}

type VideoSettingsWithTorch = MediaTrackSettings & { torch?: boolean }

function scannerVideoTrack(regionElementId: string): MediaStreamTrack | null {
  if (typeof document === 'undefined') return null
  const root = document.getElementById(regionElementId)
  const video = root?.querySelector('video')
  const src = video?.srcObject
  if (src instanceof MediaStream) {
    return src.getVideoTracks()[0] ?? null
  }
  return null
}

/** Try several constraint shapes; Chrome/Android and Safari differ. */
async function applyTorchOnVideoTrack(
  track: MediaStreamTrack,
  on: boolean,
): Promise<void> {
  const attempts: Array<MediaTrackConstraints> = [
    { advanced: [{ torch: on } as MediaTrackConstraintSet] },
    { torch: on } as MediaTrackConstraints,
    {
      advanced: [
        { torch: on, focusMode: 'continuous' } as MediaTrackConstraintSet,
      ],
    },
    {
      advanced: [
        { torch: on, exposureMode: 'continuous' } as MediaTrackConstraintSet,
      ],
    },
  ]
  let last: unknown
  for (const c of attempts) {
    try {
      await track.applyConstraints(c)
      return
    } catch (e) {
      last = e
    }
  }
  throw last
}

function torchApplyLooksApplied(
  on: boolean,
  settings: VideoSettingsWithTorch,
  caps: MediaTrackCapabilities & { torch?: boolean },
): boolean {
  if (settings.torch === on) {
    return true
  }
  if (!on && (settings.torch === false || settings.torch === undefined)) {
    return true
  }
  // Many Chromium builds omit `torch` from getSettings() even when it works.
  if (on && settings.torch === undefined) {
    // If the browser says this track cannot torch, don't treat "unknown" as success.
    return caps.torch !== false
  }
  return false
}

/**
 * Drive torch the same way html5-qrcode's built-in torch button does, with
 * fallbacks when getCapabilities() omits `torch` but applyConstraints still works.
 *
 * Some browsers resolve applyConstraints without toggling hardware torch, or only
 * one constraint shape works — try html5-qrcode's capability helper, direct track
 * updates, then applyVideoConstraints until settings look right.
 */
async function setScannerTorch(
  scanner: Html5Qrcode,
  regionElementId: string,
  on: boolean,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const camCaps = scanner.getRunningTrackCameraCapabilities()
    const torchFeat = camCaps.torchFeature()
    const track = scannerVideoTrack(regionElementId)
    const caps = scanner.getRunningTrackCapabilities() as MediaTrackCapabilities & {
      torch?: boolean
    }

    type TorchOp = () => Promise<void>
    const ops: Array<TorchOp> = []

    if (torchFeat.isSupported()) {
      ops.push(() => torchFeat.apply(on))
    }
    if (track !== null) {
      ops.push(() => applyTorchOnVideoTrack(track, on))
    }
    ops.push(() =>
      scanner.applyVideoConstraints({
        advanced: [{ torch: on } as MediaTrackConstraintSet],
      } as MediaTrackConstraints),
    )

    let lastError: unknown
    for (const op of ops) {
      try {
        await op()
      } catch (e) {
        lastError = e
        continue
      }

      const settings = scanner.getRunningTrackSettings() as VideoSettingsWithTorch
      if (torchApplyLooksApplied(on, settings, caps)) {
        return { ok: true }
      }
      lastError = new Error('Torch state did not update after applyConstraints')
    }

    const message =
      lastError instanceof DOMException
        ? `${lastError.name}: ${lastError.message}`
        : lastError instanceof Error
          ? lastError.message
          : typeof lastError === 'string'
            ? lastError
            : 'The flashlight did not respond. Use Chrome on Android if you can — iOS and some browsers only support this in limited cases.'

    return { ok: false, message }
  } catch (e) {
    const message =
      e instanceof DOMException
        ? `${e.name}: ${e.message}`
        : e instanceof Error
          ? e.message
          : typeof e === 'string'
            ? e
            : 'Could not use the flashlight.'
    return { ok: false, message }
  }
}

export function PhoneScanner({ publicId, deviceId }: Props) {
  const submitScanMutation = useMutation(api.scanSessions.submitScan)
  const submitScanRef = React.useRef(submitScanMutation)
  submitScanRef.current = submitScanMutation

  const regionId = 'phone-scanner-region'
  const containerRef = React.useRef<HTMLDivElement>(null)
  /** Picked once per session (reset when camera stops) so we open a back camera that can torch. */
  const environmentCameraDeviceIdRef = React.useRef<string | null | undefined>(
    undefined,
  )
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
  const [torchToggling, setTorchToggling] = React.useState(false)
  const [torchError, setTorchError] = React.useState<string | null>(null)
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
    environmentCameraDeviceIdRef.current = undefined
    setTorchCapability('unknown')
    setTorchOn(false)
    setTorchToggling(false)
    setTorchError(null)
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
      setTorchError(null)

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

      let environmentExactId: string | null = null
      if (face === 'environment') {
        if (environmentCameraDeviceIdRef.current === undefined) {
          environmentCameraDeviceIdRef.current =
            await resolveEnvironmentCameraDeviceId()
        }
        const cached = environmentCameraDeviceIdRef.current
        environmentExactId =
          typeof cached === 'string' && cached.length > 0 ? cached : null
      }
      const useEnvironmentDeviceId = environmentExactId !== null

      const qrbox: Html5QrcodeCameraScanConfig['qrbox'] = (
        viewfinderWidth,
        viewfinderHeight,
      ) => {
        const cap = Math.max(Math.min(viewfinderWidth, viewfinderHeight), 1)
        // Large centered guide (library dims outside this box). No tiny 340px cap — full-screen
        // layouts need a visibly obvious target on tall phones.
        const target = Math.round(cap * 0.72)
        const side = Math.min(Math.max(target, 160), Math.floor(cap * 0.92))
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
            : {
                videoConstraints: advancedVideoConstraints(face, tier, {
                  exactDeviceId: useEnvironmentDeviceId
                    ? environmentExactId
                    : undefined,
                }),
              }),
        }
        const cameraIdOrConfig =
          tier === 'low' && useEnvironmentDeviceId
            ? environmentExactId!
            : cameraIdArg(face)
        try {
          await html5.start(
            cameraIdOrConfig,
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
    if (h === null || !h.isScanning || torchToggling) return
    const next = !torchOn
    void (async () => {
      setTorchToggling(true)
      setTorchError(null)
      const result = await setScannerTorch(h, regionId, next)
      setTorchToggling(false)
      if (result.ok) {
        setTorchOn(next)
      } else {
        setTorchError(result.message)
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
    <div className="flex min-h-0 flex-1 flex-col">
      {(queuedCount > 0 || sendingQueued) && (
        <p className="shrink-0 border-b border-amber-500/35 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-950 dark:text-amber-100">
          {sendingQueued
            ? 'Sending queued scans…'
            : `Offline: ${queuedCount} queued — will send when online.`}
        </p>
      )}

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-black">
        <div
          ref={containerRef}
          className={cn(
            'relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
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
            className="scanner-video-host min-h-0 min-w-0 flex-1 overflow-hidden"
            id={regionId}
          />
          {/* Corner brackets aligned ~with html5-qrcode qrbox (large center target). */}
          <div
            className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center"
            aria-hidden
          >
            <div className="scanner-target-brackets aspect-square w-[min(72vw,72vmin)] max-h-[55dvh] max-w-[min(72vw,420px)] shrink-0" />
          </div>
          {scanPreview ? (
            <div
              className="pointer-events-none absolute inset-x-2 bottom-2 z-[6] rounded-md border border-white/15 bg-black/80 px-2 py-1.5 shadow-lg backdrop-blur-sm"
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
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-white/90">
            Starting camera…
          </p>
        )}
        {cameraPhase === 'off' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-4">
            <Button type="button" onClick={onStartCamera} size="lg">
              Start camera
            </Button>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border bg-background/95 px-3 pt-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[calc(1rem+env(safe-area-inset-bottom,0px)+28px)]">
        {torchError ? (
          <p className="mb-2 text-sm text-amber-950 dark:text-amber-100">
            {torchError}
          </p>
        ) : null}
        {cameraError ? (
          <p className="mb-2 text-sm text-destructive">{cameraError}</p>
        ) : null}
        {submitError ? (
          <div className="mb-2 space-y-2">
            <p className="text-sm text-destructive">{submitError}</p>
            {lastFailedSubmit !== null ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onRetrySend}
              >
                Retry send
              </Button>
            ) : null}
          </div>
        ) : null}
        <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
          {cameraPhase === 'running' && (
            <>
              <Button
                type="button"
                className="min-h-11 w-full shrink-0 sm:min-w-0 sm:flex-1"
                variant="secondary"
                onClick={onStopCamera}
              >
                Stop camera
              </Button>
              <Button
                type="button"
                className="min-h-11 w-full min-w-0 shrink-0 sm:flex-1"
                variant="outline"
                onClick={onFlipCamera}
              >
                {facingMode === 'environment'
                  ? 'Front camera'
                  : 'Back camera'}
              </Button>
              {showFlashlightToggle ? (
                <Button
                  type="button"
                  className="min-h-11 w-full min-w-0 shrink-0 sm:flex-1"
                  variant={torchOn ? 'default' : 'outline'}
                  onClick={onToggleTorch}
                  disabled={torchToggling}
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
            <Button
              type="button"
              className="min-h-11 w-full sm:flex-1"
              onClick={onRetryCamera}
            >
              Retry camera
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
