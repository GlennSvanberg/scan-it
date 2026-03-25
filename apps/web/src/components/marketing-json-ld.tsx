import {
  organizationJsonLd,
  softwareApplicationJsonLd,
  webSiteJsonLd,
} from '~/lib/structured-data'

/** JSON-LD in the document body (valid for Google). */
export function MarketingJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationJsonLd(),
      webSiteJsonLd(),
      softwareApplicationJsonLd(),
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
