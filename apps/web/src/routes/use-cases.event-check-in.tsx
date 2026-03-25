import { createFileRoute } from '@tanstack/react-router'
import { marketingArticleRouteOptions } from '~/lib/marketing-article-route'

export const Route = createFileRoute('/use-cases/event-check-in')({
  ...marketingArticleRouteOptions('/use-cases/event-check-in'),
})
