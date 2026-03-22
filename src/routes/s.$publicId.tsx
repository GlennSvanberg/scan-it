import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import * as React from 'react'
import { api } from '../../convex/_generated/api'
import { PhoneScanner } from '~/components/phone-scanner'
import { SiteHeader } from '~/components/site-header'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { getOrCreateDeviceId } from '~/lib/deviceId'

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
              <CardTitle>Invalid session</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This link does not match an active session. Start a new session
                on your computer.
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
              <CardTitle>Session ended</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The desktop closed this session. Start again from the computer
                if you need to continue.
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
                Another phone is already paired with this session. Only one
                device can scan for each desk session.
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
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <PhoneScanner publicId={publicId} deviceId={deviceId} />
      </main>
    </div>
  )
}
