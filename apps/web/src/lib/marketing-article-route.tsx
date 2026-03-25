import { MarketingArticlePage } from '~/components/marketing-article-page'
import { getMarketingArticle } from '~/content/marketing-articles'
import { pageMeta } from '~/lib/seo-head'

export function marketingArticleRouteOptions(path: string) {
  const article = getMarketingArticle(path)
  if (!article) {
    throw new Error(`Missing marketing article for path: ${path}`)
  }
  return {
    ssr: false as const,
    head: () => ({
      meta: pageMeta({
        title: article.title,
        description: article.description,
        path: article.path,
      }) as never,
    }),
    component: function MarketingArticleRoute() {
      return <MarketingArticlePage article={article} />
    },
  }
}
