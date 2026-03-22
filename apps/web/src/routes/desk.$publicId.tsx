import { createFileRoute } from '@tanstack/react-router'
import { DeskScreen } from '@scan-it/features'

export const Route = createFileRoute('/desk/$publicId')({
  ssr: false,
  component: DeskRoute,
})

function DeskRoute() {
  const { publicId } = Route.useParams()
  return <DeskScreen publicId={publicId} />
}
