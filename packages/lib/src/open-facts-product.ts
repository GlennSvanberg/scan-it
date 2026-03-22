/**
 * Open Food Facts / Open Beauty Facts product API (v0 JSON).
 * Identify requests per https://openfoodfacts.github.io/openfoodfacts-server/api/
 * (descriptive User-Agent when the runtime allows it; low volume for desk use).
 */

import {
  joinEnrichmentFieldValues,
  sanitizeEnrichmentCell,
} from './enrichment-cell.ts'
import type { EnrichSeparator } from './enrichment-cell.ts'

const FETCH_TIMEOUT_MS = 10_000

/** Desktop app identification for API etiquette (may be ignored in browser fetch). */
const OPEN_FACTS_USER_AGENT =
  'ScanIt/1.0 (https://github.com/topics/scan-it; desk enrichment)'

const OPEN_FOOD_FACTS_BASE = 'https://world.openfoodfacts.org'
const OPEN_BEAUTY_FACTS_BASE = 'https://world.openbeautyfacts.org'

export type OpenFactsRealm = 'food' | 'beauty'

export type ProductFieldId =
  | 'scannedCode'
  | 'code'
  | 'productName'
  | 'brands'
  | 'quantity'
  | 'categories'
  | 'ingredientsText'
  | 'allergens'
  | 'traces'
  | 'countries'
  | 'nutriscoreGrade'
  | 'productUrl'

export const ALL_PRODUCT_FIELD_IDS: Array<ProductFieldId> = [
  'scannedCode',
  'code',
  'productName',
  'brands',
  'quantity',
  'categories',
  'ingredientsText',
  'allergens',
  'traces',
  'countries',
  'nutriscoreGrade',
  'productUrl',
]

export const PRODUCT_FIELD_LABELS: Record<ProductFieldId, string> = {
  scannedCode: 'Scanned code',
  code: 'Standard barcode number',
  productName: 'Product name',
  brands: 'Brands',
  quantity: 'Quantity',
  categories: 'Categories (first 5)',
  ingredientsText: 'Ingredients',
  allergens: 'Allergens',
  traces: 'Traces',
  countries: 'Countries',
  nutriscoreGrade: 'Nutri-Score grade',
  productUrl: 'Link to product page',
}

export type OpenFactsProduct = Record<string, unknown>

type OpenFactsProductJson = {
  status?: number
  status_verbose?: string
  code?: string
  product?: OpenFactsProduct
}

function realmToOrigin(realm: OpenFactsRealm): string {
  return realm === 'food' ? OPEN_FOOD_FACTS_BASE : OPEN_BEAUTY_FACTS_BASE
}

/**
 * Strip non-digits; accept EAN-8, EAN-13, GTIN-14, and UPC-A (12 digits → leading 0).
 */
export function normalizeGtinForLookup(raw: string): string | null {
  const d = raw.replace(/\D/g, '')
  if (d.length === 12) return `0${d}`
  if (d.length === 8 || d.length === 13 || d.length === 14) return d
  return null
}

function stringField(p: OpenFactsProduct | null, key: string): string {
  if (p === null) return ''
  const v = p[key]
  return typeof v === 'string' ? v.trim() : ''
}

function categoriesDisplay(
  product: OpenFactsProduct | null,
  max: number,
): string {
  if (product === null) return ''
  const raw = stringField(product, 'categories')
  if (raw) {
    const parts = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    return parts.slice(0, max).join('; ')
  }
  const tags = product.categories_tags
  if (!Array.isArray(tags)) return ''
  const out: Array<string> = []
  for (const t of tags) {
    if (typeof t !== 'string' || !t.trim()) continue
    const human = t.replace(/^..:/, '').replace(/-/g, ' ')
    out.push(human)
    if (out.length >= max) break
  }
  return out.join('; ')
}

function countriesDisplay(product: OpenFactsProduct | null): string {
  if (product === null) return ''
  const c = stringField(product, 'countries')
  if (c) return c
  const tags = product.countries_tags
  if (!Array.isArray(tags)) return ''
  return tags
    .filter((x): x is string => typeof x === 'string')
    .map((t) => t.replace(/^..:/, ''))
    .join('; ')
}

function nutriscoreDisplay(product: OpenFactsProduct | null): string {
  if (product === null) return ''
  const a = stringField(product, 'nutriscore_grade')
  if (a) return a.toUpperCase()
  const b = stringField(product, 'nutrition_grade_fr')
  return b ? b.toUpperCase() : ''
}

const offFetchCache = new Map<string, Promise<OpenFactsProduct | null>>()

async function fetchWithTimeout(
  url: string,
  signal?: AbortSignal,
): Promise<Response> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
  const onAbort = () => ctrl.abort()
  if (signal) {
    if (signal.aborted) {
      clearTimeout(t)
      throw new DOMException('Aborted', 'AbortError')
    }
    signal.addEventListener('abort', onAbort)
  }
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': OPEN_FACTS_USER_AGENT,
      },
    })
  } finally {
    clearTimeout(t)
    if (signal) signal.removeEventListener('abort', onAbort)
  }
}

/**
 * Fetch product by GTIN code. Cached per realm+code. Returns `product` or null if not found.
 */
export async function fetchOpenFactsProduct(
  realm: OpenFactsRealm,
  code: string,
  options?: { signal?: AbortSignal },
): Promise<OpenFactsProduct | null> {
  const key = `${realm}:${code}`
  const hit = offFetchCache.get(key)
  if (hit) return hit

  const origin = realmToOrigin(realm)
  const url = `${origin}/api/v0/product/${encodeURIComponent(code)}.json`
  const promise = (async () => {
    try {
      const res = await fetchWithTimeout(url, options?.signal)
      if (!res.ok) return null
      const json = (await res.json()) as OpenFactsProductJson
      if (json.status !== 1 || json.product === undefined) return null
      return json.product
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') throw e
      return null
    }
  })()

  offFetchCache.set(key, promise)
  try {
    const result = await promise
    if (result === null) offFetchCache.delete(key)
    return result
  } catch (e) {
    offFetchCache.delete(key)
    throw e
  }
}

export function productRecordToFieldValues(
  record: OpenFactsProduct | null,
  fieldIds: Array<ProductFieldId>,
  scannedCode: string,
  normalizedCode: string | null,
  realm: OpenFactsRealm,
  separator: EnrichSeparator,
  options?: { categoriesMax?: number },
): Array<string> {
  const categoriesMax = options?.categoriesMax ?? 5
  const origin = realmToOrigin(realm)
  const codeForUrl = normalizedCode ?? ''

  return fieldIds.map((id) => {
    let raw = ''
    switch (id) {
      case 'scannedCode':
        raw = scannedCode
        break
      case 'code':
        raw = normalizedCode ?? ''
        break
      case 'productName':
        raw = stringField(record, 'product_name')
        break
      case 'brands':
        raw = stringField(record, 'brands')
        break
      case 'quantity':
        raw = stringField(record, 'quantity')
        break
      case 'categories':
        raw = categoriesDisplay(record, categoriesMax)
        break
      case 'ingredientsText':
        raw = stringField(record, 'ingredients_text')
        break
      case 'allergens':
        raw = stringField(record, 'allergens')
        break
      case 'traces':
        raw = stringField(record, 'traces')
        break
      case 'countries':
        raw = countriesDisplay(record)
        break
      case 'nutriscoreGrade':
        raw = nutriscoreDisplay(record)
        break
      case 'productUrl':
        raw = codeForUrl ? `${origin}/product/${encodeURIComponent(codeForUrl)}` : ''
        break
    }
    return sanitizeEnrichmentCell(raw, separator)
  })
}

export type ResolveOpenFactsLineResult = {
  line: string
  found: boolean
  values: Array<string>
}

export async function resolveOpenFactsEnrichmentLine(
  scannedCode: string,
  realm: OpenFactsRealm,
  fieldIds: Array<ProductFieldId>,
  separator: EnrichSeparator,
  options?: { signal?: AbortSignal },
): Promise<ResolveOpenFactsLineResult> {
  if (fieldIds.length === 0) {
    return { line: '', found: false, values: [] }
  }

  const code = normalizeGtinForLookup(scannedCode)
  if (!code) {
    const values = productRecordToFieldValues(
      null,
      fieldIds,
      scannedCode,
      null,
      realm,
      separator,
    )
    return {
      line: joinEnrichmentFieldValues(values, separator),
      found: false,
      values,
    }
  }

  const record = await fetchOpenFactsProduct(realm, code, options)
  const found = record !== null
  const values = productRecordToFieldValues(
    record,
    fieldIds,
    scannedCode,
    code,
    realm,
    separator,
  )
  return {
    line: joinEnrichmentFieldValues(values, separator),
    found,
    values,
  }
}
