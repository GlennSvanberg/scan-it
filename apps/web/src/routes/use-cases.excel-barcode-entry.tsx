import { createFileRoute } from '@tanstack/react-router'
import { marketingArticleRouteOptions } from '~/lib/marketing-article-route'

export const Route = createFileRoute('/use-cases/excel-barcode-entry')({
  ...marketingArticleRouteOptions('/use-cases/excel-barcode-entry'),
})
