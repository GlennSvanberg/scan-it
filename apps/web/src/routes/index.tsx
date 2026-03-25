import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '~/components/landing-page'
import { pageMeta } from '~/lib/seo-head'

export const Route = createFileRoute('/')({
  ssr: false,
  head: () => ({
    meta: pageMeta({
      title: 'Scan It — Wireless barcode scanner for PC',
      description:
        'Turn your phone into a wireless barcode scanner. Pair with a QR code, scan barcodes to your computer in real time—no USB hardware. Optional desktop app types into Excel and other apps.',
      path: '/',
    }) as never,
  }),
  component: LandingPage,
})
