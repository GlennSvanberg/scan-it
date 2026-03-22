import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '~/components/landing-page'

export const Route = createFileRoute('/')({
  ssr: false,
  component: LandingPage,
})
