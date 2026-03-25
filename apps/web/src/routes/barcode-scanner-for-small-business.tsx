import { createFileRoute } from '@tanstack/react-router'
import { marketingArticleRouteOptions } from '~/lib/marketing-article-route'

export const Route = createFileRoute('/barcode-scanner-for-small-business')({
  ...marketingArticleRouteOptions('/barcode-scanner-for-small-business'),
})
