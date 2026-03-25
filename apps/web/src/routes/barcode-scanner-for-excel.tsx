import { createFileRoute } from '@tanstack/react-router'
import { marketingArticleRouteOptions } from '~/lib/marketing-article-route'

export const Route = createFileRoute('/barcode-scanner-for-excel')({
  ...marketingArticleRouteOptions('/barcode-scanner-for-excel'),
})
