import { useMutation } from 'convex/react'
import * as React from 'react'
import { api } from '../../convex/_generated/api'
import type { Html5Qrcode } from 'html5-qrcode'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

type Props = {
  publicId: string
  deviceId: string
}

export function PhoneScanner({ publicId, deviceId }: Props) {
  const submitScan = useMutation(api.scanSessions.submitScan)
  const regionId = 'phone-scanner-region'
  const lastRef = React.useRef<{ value: string; at: number } | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [starting, setStarting] = React.useState(true)

  React.useEffect(() => {
    let html5: Html5Qrcode | null = null

    const onDecoded = async (text: string, format?: string) => {
      const now = Date.now()
      const last = lastRef.current
      if (last && last.value === text && now - last.at < 1500) {
        return
      }
      lastRef.current = { value: text, at: now }
      try {
        await submitScan({
          publicId,
          deviceId,
          value: text,
          format: format || undefined,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not send scan')
      }
    }

    ;(async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        html5 = new Html5Qrcode(regionId, {
          verbose: false,
        })
        await html5.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          (decodedText, decodedResult) => {
            const fmt = decodedResult.result.format?.formatName
            void onDecoded(decodedText, fmt ?? undefined)
          },
          () => {},
        )
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : 'Camera failed to start. Check permissions.',
        )
      } finally {
        setStarting(false)
      }
    })()

    return () => {
      if (html5 !== null && html5.isScanning) {
        void html5.stop().catch(() => {})
      }
    }
  }, [publicId, deviceId, submitScan])

  return (
    <Card className="overflow-hidden border-primary/30">
      <CardHeader>
        <CardTitle>Scanner</CardTitle>
        <p className="font-mono text-xs text-muted-foreground">
          Point at barcodes or QR codes. Results appear on your computer.
        </p>
      </CardHeader>
      <CardContent className="space-y-3 p-0">
        <div className="relative bg-black/80 px-2 pb-4 pt-2">
          <div
            className="scanner-frame mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-lg"
            id={regionId}
          />
          {starting && (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
              Starting camera…
            </p>
          )}
        </div>
        {error ? (
          <p className="border-l-2 border-destructive px-5 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
