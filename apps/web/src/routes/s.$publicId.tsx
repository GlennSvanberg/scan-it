import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import * as React from 'react'
import { api } from '@scan-it/convex-api'
import { Button, Card, CardContent, CardHeader, CardTitle, SiteHeader } from '@scan-it/features'
import { getOrCreateDeviceId } from '@scan-it/lib'
import { PhoneScanner } from '~/components/phone-scanner'
import { PortraitScannerGate } from '~/components/portrait-scanner-gate'

export const Route = createFileRoute('/s/$publicId')({
  ssr: false,
  component: PhonePage,
})

function PhonePage() {
  const { publicId } = Route.useParams()
  const [deviceId, setDeviceId] = React.useState('')
  const [claimError, setClaimError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setDeviceId(getOrCreateDeviceId())
  }, [])

  const phone = useQuery(
    api.scanSessions.getPhoneSession,
    deviceId ? { publicId, deviceId } : 'skip',
  )

  const claimPhone = useMutation(api.scanSessions.claimPhone)

  React.useEffect(() => {
    if (!deviceId || !phone || !phone.exists || !phone.canClaim) return
    let cancelled = false
    setClaimError(null)
    void claimPhone({ publicId, deviceId }).catch((e) => {
      if (!cancelled) {
        setClaimError(e instanceof Error ? e.message : 'Could not pair')
      }
    })
    return () => {
      cancelled = true
    }
  }, [deviceId, publicId, phone?.exists, phone?.canClaim, claimPhone])

  if (!deviceId || phone === undefined) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center p-6">
          <p className="text-muted-foreground">Loading…</p>
        </main>
      </div>
    )
  }

  if (!phone.exists) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center p-6">
          <Card className="max-w-md border-destructive/40">
            <CardHeader>
              <CardTitle>Link not valid</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This link does not match an active desk. Open Scan It on your
                computer to get a new QR code or link.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (phone.status === 'ended') {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center p-6">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Desk closed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The desk on your computer was closed (for example, the tab was
                closed). Open Scan It there again if you need to keep scanning.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (phone.paired && !phone.isThisDevice) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center p-6">
          <Card className="max-w-md border-primary/30">
            <CardHeader>
              <CardTitle>Already paired</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Another phone is already connected to this desk. Only one phone
                can scan at a time.
              </p>
              <Button type="button" variant="outline" asChild>
                <Link to="/">Home</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (claimError) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center p-6">
          <Card className="max-w-md border-destructive/40">
            <CardHeader>
              <CardTitle>Pairing failed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive">{claimError}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!phone.isThisDevice) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center p-6">
          <p className="text-muted-foreground">Pairing…</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden">
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <PortraitScannerGate>
          <PhoneScanner publicId={publicId} deviceId={deviceId} />
        </PortraitScannerGate>
      </main>
    </div>
  )
}
