/**
 * HTTP actions are served from `.convex.site`; the browser client URL is usually `.convex.cloud`.
 * Used for tab-close `sendBeacon` to end a desk without the WebSocket client.
 */
export function convexHttpSiteOrigin(convexCloudUrl: string): string | null {
  const trimmed = convexCloudUrl.trim()
  if (!trimmed) return null
  try {
    const u = new URL(trimmed)
    if (!u.hostname.endsWith('.convex.cloud')) {
      return null
    }
    u.hostname = u.hostname.replace(/\.convex\.cloud$/i, '.convex.site')
    u.pathname = ''
    u.search = ''
    u.hash = ''
    return u.origin
  } catch {
    return null
  }
}
