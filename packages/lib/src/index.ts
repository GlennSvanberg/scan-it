export {
  clearDeskToken,
  deskStorageKey,
  readDeskToken,
  saveDeskToken,
} from './desk-token.ts'
export { getOrCreateDeviceId } from './device-id.ts'
export {
  getPairingOrigin,
  resolvePairingBase,
  type PairingEnv,
} from './pairing.ts'
export { cn } from './utils.ts'
export { convexHttpSiteOrigin } from './convex-http-site.ts'
export {
  allDesktopDownloadRows,
  DEFAULT_DESKTOP_RELEASE_BASE,
  detectClientDesktopKind,
  getPrimaryDesktopDownloadHref,
  primaryDesktopDownloadLabel,
  resolveDesktopDownloadUrls,
} from './desktop-download.ts'
export type {
  DesktopDownloadEnvSource,
  DesktopDownloadRow,
  DesktopKind,
  ResolvedDesktopDownloads,
} from './desktop-download.ts'
export {
  joinEnrichmentFieldValues,
  sanitizeEnrichmentCell,
} from './enrichment-cell.ts'
export type { EnrichSeparator } from './enrichment-cell.ts'
export {
  ALL_BOOK_FIELD_IDS,
  BOOK_FIELD_LABELS,
  bookRecordToFieldValues,
  fetchOpenLibraryByIsbn,
  isbn10ToIsbn13,
  joinBookFieldValues,
  normalizeIsbnForLookup,
  resolveOpenLibraryEnrichmentLine,
  sanitizeBookCell,
} from './open-library.ts'
export type {
  BookEnrichSeparator,
  BookFieldId,
  OpenLibraryBookEntry,
  ResolveOpenLibraryLineResult,
} from './open-library.ts'
export {
  ALL_PRODUCT_FIELD_IDS,
  fetchOpenFactsProduct,
  normalizeGtinForLookup,
  PRODUCT_FIELD_LABELS,
  productRecordToFieldValues,
  resolveOpenFactsEnrichmentLine,
} from './open-facts-product.ts'
export type {
  OpenFactsProduct,
  OpenFactsRealm,
  ProductFieldId,
  ResolveOpenFactsLineResult,
} from './open-facts-product.ts'
