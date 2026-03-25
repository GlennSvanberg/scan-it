import { createFileRoute } from '@tanstack/react-router'
import { PhonePairingScreen } from '@scan-it/features'
import { pageMeta } from '~/lib/seo-head'

export const Route = createFileRoute('/s/$publicId')({
  ssr: false,
  head: ({ params }) => ({
    meta: pageMeta({
      title: 'Phone pairing | Scan It',
      description:
        'Pair your phone with this Scan It desk session to use your camera as a wireless barcode scanner.',
      path: `/s/${params.publicId}`,
      robots: 'noindex, nofollow',
    }) as never,
  }),
  component: PhoneRoute,
})

function PhoneRoute() {
  const { publicId } = Route.useParams()
  return <PhonePairingScreen publicId={publicId} />
}
