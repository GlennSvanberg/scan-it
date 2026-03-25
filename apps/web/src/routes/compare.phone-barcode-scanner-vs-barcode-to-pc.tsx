import { createFileRoute } from '@tanstack/react-router'
import { marketingArticleRouteOptions } from '~/lib/marketing-article-route'

export const Route = createFileRoute(
  '/compare/phone-barcode-scanner-vs-barcode-to-pc',
)({
  ...marketingArticleRouteOptions(
    '/compare/phone-barcode-scanner-vs-barcode-to-pc',
  ),
})
