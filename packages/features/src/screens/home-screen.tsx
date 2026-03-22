import { useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import * as React from 'react'
import { api } from '@scan-it/convex-api'
import { saveDeskToken } from '@scan-it/lib'
import { SiteHeader } from '../components/site-header.tsx'
import { Button } from '../components/ui/button.tsx'

export function HomeScreen() {
  const navigate = useNavigate()
  const createSession = useMutation(api.scanSessions.createSession)
  const [busy, setBusy] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const cancelledRef = React.useRef(false)
  React.useEffect(() => {
    cancelledRef.current = false
    void (async () => {
      setBusy(true)
      setError(null)
      try {
        const { publicId, deskToken } = await createSession({})
        if (cancelledRef.current) return
        saveDeskToken(publicId, deskToken)
        await navigate({ to: '/desk/$publicId', params: { publicId } })
      } catch (e) {
        if (!cancelledRef.current) {
          setError(
            e instanceof Error ? e.message : 'Could not open your desk. Try again.',
          )
        }
      } finally {
        if (!cancelledRef.current) setBusy(false)
      }
    })()
    return () => {
      cancelledRef.current = true
    }
  }, [createSession, navigate])

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-20 pt-8 md:px-8">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
          {error ? (
            <>
              <p className="text-sm text-destructive">{error}</p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void navigate({ to: '/' })}
              >
                Back
              </Button>
            </>
          ) : (
            <p className="font-mono text-sm text-muted-foreground">
              {busy ? 'Preparing your desk…' : 'Redirecting…'}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
