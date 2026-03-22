import { createFileRoute } from '@tanstack/react-router'
import { HomeScreen } from '@scan-it/features'

export const Route = createFileRoute('/start')({
  ssr: false,
  component: HomeScreen,
})
