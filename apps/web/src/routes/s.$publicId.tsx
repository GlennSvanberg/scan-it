import { createFileRoute } from '@tanstack/react-router'
import { PhonePairingScreen } from '@scan-it/features'

export const Route = createFileRoute('/s/$publicId')({
  ssr: false,
  component: PhoneRoute,
})

function PhoneRoute() {
  const { publicId } = Route.useParams()
  return <PhonePairingScreen publicId={publicId} />
}
