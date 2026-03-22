import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import * as React from 'react'
import { api } from '../../convex/_generated/api'
import { SiteHeader } from '~/components/site-header'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { saveDeskToken } from '~/lib/deskToken'

export const Route = createFileRoute('/')({
  ssr: false,
  component: Home,
})

function Home() {
  const navigate = useNavigate()
  const createSession = useMutation(api.scanSessions.createSession)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onStart = async () => {
    setBusy(true)
    setError(null)
    try {
      const { publicId, deskToken } = await createSession({})
      saveDeskToken(publicId, deskToken)
      await navigate({ to: '/desk/$publicId', params: { publicId } })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start session')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-20 pt-8 md:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 text-center">
          <div className="space-y-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-muted-foreground">
              Phone → Convex → Desktop
            </p>
            <h1 className="text-4xl font-bold uppercase tracking-tight text-foreground md:text-6xl dark:text-glow">
              Scan It
            </h1>
            <p className="mx-auto max-w-md font-mono text-sm leading-relaxed text-muted-foreground">
              Pair your phone as a wireless scanner. No accounts — one session,
              one phone, full log on the desktop until you end the session.
            </p>
          </div>

          <Card className="border-primary/25 text-left shadow-glow-sm">
            <CardHeader>
              <CardTitle>Desktop</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="border-l-2 border-primary pl-4 text-sm text-muted-foreground">
                Open this site on your computer, start a session, then scan the
                QR code with your phone. Everything you scan is sent here in real
                time.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button type="button" disabled={busy} onClick={() => void onStart()}>
                  {busy ? 'Starting…' : 'Start scan session'}
                </Button>
              </div>
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
