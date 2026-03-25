import { createFileRoute } from '@tanstack/react-router'
import { marketingArticleRouteOptions } from '~/lib/marketing-article-route'

export const Route = createFileRoute('/use-cases/retail-stocktakes')({
  ...marketingArticleRouteOptions('/use-cases/retail-stocktakes'),
})
