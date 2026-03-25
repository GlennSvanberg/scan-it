import { createFileRoute } from '@tanstack/react-router'
import { marketingArticleRouteOptions } from '~/lib/marketing-article-route'

export const Route = createFileRoute('/qr-scanner-to-pc')({
  ...marketingArticleRouteOptions('/qr-scanner-to-pc'),
})
