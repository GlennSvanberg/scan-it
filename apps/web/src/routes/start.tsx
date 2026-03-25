import { createFileRoute } from '@tanstack/react-router'
import { HomeScreen } from '@scan-it/features'
import { pageMeta } from '~/lib/seo-head'

export const Route = createFileRoute('/start')({
  ssr: false,
  head: () => ({
    meta: pageMeta({
      title: 'Start scanning | Scan It',
      description:
        'Open the Scan It desk to pair your phone and start scanning barcodes to your computer.',
      path: '/start',
      robots: 'noindex, follow',
    }) as never,
  }),
  component: HomeScreen,
})
