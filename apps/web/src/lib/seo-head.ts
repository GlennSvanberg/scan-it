import type { MetaDescriptor } from '@tanstack/react-router'

/** Production origin for canonical URLs (from `VITE_PAIRING_ORIGIN`). */
export function webAppSiteOrigin(): string {
  const p = import.meta.env.VITE_PAIRING_ORIGIN?.trim()
  if (!p) return ''
  try {
    return new URL(p).origin
  } catch {
    return ''
  }
}

export function canonicalUrlForPath(pathname: string): string | undefined {
  const o = webAppSiteOrigin()
  if (!o) return undefined
  const p = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${o}${p}`
}

export function pageMeta(opts: {
  title: string
  description: string
  path: string
  robots?: string
}): Array<MetaDescriptor> {
  const url = canonicalUrlForPath(opts.path)
  const robots = opts.robots ?? 'index, follow'

  const meta: Array<MetaDescriptor> = [
    { title: opts.title },
    { name: 'description', content: opts.description },
    { name: 'robots', content: robots },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: opts.title },
    { name: 'twitter:description', content: opts.description },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Scan It' },
    { property: 'og:title', content: opts.title },
    { property: 'og:description', content: opts.description },
  ]

  if (url) {
    meta.push({ property: 'og:url', content: url })
    meta.push({
      tagName: 'link',
      rel: 'canonical',
      href: url,
    })
  }

  return meta
}
