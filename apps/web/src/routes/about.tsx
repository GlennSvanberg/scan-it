import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '~/components/about-page'
import { pageMeta } from '~/lib/seo-head'

export const Route = createFileRoute('/about')({
  ssr: false,
  head: () => ({
    meta: pageMeta({
      title: 'About Scan It',
      description:
        'Scan It turns your phone into a wireless barcode and QR scanner for your computer—built for real desk workflows.',
      path: '/about',
    }) as never,
  }),
  component: AboutPage,
})
