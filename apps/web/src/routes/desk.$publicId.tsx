import { createFileRoute } from '@tanstack/react-router'
import { DeskScreen } from '@scan-it/features'
import { pageMeta } from '~/lib/seo-head'

export const Route = createFileRoute('/desk/$publicId')({
  ssr: false,
  head: ({ params }) => ({
    meta: pageMeta({
      title: 'Desk session | Scan It',
      description:
        'Active Scan It desk session. Pair your phone to send barcode and QR scans to this computer in real time.',
      path: `/desk/${params.publicId}`,
      robots: 'noindex, nofollow',
    }) as never,
  }),
  component: DeskRoute,
})

function DeskRoute() {
  const { publicId } = Route.useParams()
  return <DeskScreen publicId={publicId} />
}
