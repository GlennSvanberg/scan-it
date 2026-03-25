import { createFileRoute } from '@tanstack/react-router'
import { marketingArticleRouteOptions } from '~/lib/marketing-article-route'

export const Route = createFileRoute('/wireless-barcode-scanner')({
  ...marketingArticleRouteOptions('/wireless-barcode-scanner'),
})
