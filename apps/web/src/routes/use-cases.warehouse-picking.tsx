import { createFileRoute } from '@tanstack/react-router'
import { marketingArticleRouteOptions } from '~/lib/marketing-article-route'

export const Route = createFileRoute('/use-cases/warehouse-picking')({
  ...marketingArticleRouteOptions('/use-cases/warehouse-picking'),
})
