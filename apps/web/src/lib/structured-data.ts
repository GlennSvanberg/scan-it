import { canonicalUrlForPath, webAppSiteOrigin } from './seo-head'

function siteRootUrl(): string {
  const o = webAppSiteOrigin()
  return o ? `${o}/` : ''
}

export function organizationJsonLd() {
  const origin = webAppSiteOrigin()
  const root = siteRootUrl()
  return {
    '@type': 'Organization',
    '@id': origin ? `${origin}/#organization` : undefined,
    name: 'Scan It',
    url: root || undefined,
    sameAs: [
      'https://github.com/GlennSvanberg/scan-it',
      'https://x.com/GlennSvanberg',
    ],
  }
}

export function webSiteJsonLd() {
  const origin = webAppSiteOrigin()
  const root = canonicalUrlForPath('/') ?? siteRootUrl()
  return {
    '@type': 'WebSite',
    '@id': origin ? `${origin}/#website` : undefined,
    url: root || undefined,
    name: 'Scan It',
    publisher: origin ? { '@id': `${origin}/#organization` } : undefined,
  }
}

export function softwareApplicationJsonLd() {
  const origin = webAppSiteOrigin()
  const root = canonicalUrlForPath('/') ?? siteRootUrl()
  return {
    '@type': 'SoftwareApplication',
    '@id': origin ? `${origin}/#software` : undefined,
    name: 'Scan It',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Windows, macOS',
    url: root || undefined,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Use your phone as a wireless barcode and QR scanner. Scans appear on your computer in real time.',
  }
}
