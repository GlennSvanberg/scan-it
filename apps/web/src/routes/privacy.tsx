import { createFileRoute } from '@tanstack/react-router'
import { PrivacyPage } from '~/components/privacy-page'
import { pageMeta } from '~/lib/seo-head'

export const Route = createFileRoute('/privacy')({
  ssr: false,
  head: () => ({
    meta: pageMeta({
      title: 'Privacy Policy | Scan It',
      description:
        'How Scan It handles data when you use the site and web app, and how to contact us.',
      path: '/privacy',
    }) as never,
  }),
  component: PrivacyPage,
})
