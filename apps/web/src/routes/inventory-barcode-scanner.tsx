import { createFileRoute } from '@tanstack/react-router'
import { marketingArticleRouteOptions } from '~/lib/marketing-article-route'

export const Route = createFileRoute('/inventory-barcode-scanner')({
  ...marketingArticleRouteOptions('/inventory-barcode-scanner'),
})
