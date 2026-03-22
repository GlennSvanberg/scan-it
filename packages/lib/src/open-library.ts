/** Open Library Books API (jscmd=data) — https://openlibrary.org/dev/docs/api/books */

import {
  joinEnrichmentFieldValues,
  sanitizeEnrichmentCell,
} from './enrichment-cell.ts'
import type { EnrichSeparator } from './enrichment-cell.ts'

const OPEN_LIBRARY_BOOKS =
  'https://openlibrary.org/api/books?jscmd=data&format=json'

const FETCH_TIMEOUT_MS = 10_000

export type BookFieldId =
  | 'scannedCode'
  | 'title'
  | 'authors'
  | 'publishers'
  | 'publishDate'
  | 'pageCount'
  | 'publishPlaces'
  | 'subjects'
  | 'openLibraryUrl'
  | 'isbn13'

export const ALL_BOOK_FIELD_IDS: Array<BookFieldId> = [
  'scannedCode',
  'title',
  'authors',
  'publishers',
  'publishDate',
  'pageCount',
  'publishPlaces',
  'subjects',
  'isbn13',
  'openLibraryUrl',
]

export const BOOK_FIELD_LABELS: Record<BookFieldId, string> = {
  scannedCode: 'Scanned code',
  title: 'Title',
  authors: 'Authors',
  publishers: 'Publishers',
  publishDate: 'Publish date',
  pageCount: 'Page count',
  publishPlaces: 'Publish places',
  subjects: 'Subjects (first 5)',
  isbn13: 'ISBN-13',
  openLibraryUrl: 'Link to book page',
}

export type BookEnrichSeparator = EnrichSeparator

export type OpenLibraryNamed = { name?: string }
export type OpenLibraryBookEntry = {
  title?: string
  url?: string
  authors?: Array<OpenLibraryNamed>
  publishers?: Array<OpenLibraryNamed>
  publish_date?: string
  number_of_pages?: number
  pagination?: string
  publish_places?: Array<OpenLibraryNamed>
  subjects?: Array<OpenLibraryNamed>
  identifiers?: Record<string, Array<string>>
  by_statement?: string
  notes?: string
  classifications?: {
    dewey_decimal_class?: Array<string>
    lc_classifications?: Array<string>
  }
}

type OpenLibraryBooksJson = Record<string, OpenLibraryBookEntry | undefined>

function isbn10CheckDigit(body9: string): string {
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += (10 - i) * parseInt(body9.charAt(i), 10)
  }
  const r = (11 - (sum % 11)) % 11
  return r === 10 ? 'X' : String(r)
}

function isValidIsbn10(s: string): boolean {
  if (!/^\d{9}[\dX]$/i.test(s)) return false
  return (
    isbn10CheckDigit(s.slice(0, 9)).toUpperCase() === s.charAt(9).toUpperCase()
  )
}

function isbn13CheckDigit(body12: string): string {
  let sum = 0
  for (let i = 0; i < 12; i++) {
    const n = parseInt(body12.charAt(i), 10)
    sum += n * (i % 2 === 0 ? 1 : 3)
  }
  return String((10 - (sum % 10)) % 10)
}

function isValidIsbn13(s: string): boolean {
  if (!/^\d{13}$/.test(s)) return false
  return isbn13CheckDigit(s.slice(0, 12)) === s.charAt(12)
}

/** Convert validated ISBN-10 (incl. check) to ISBN-13. */
export function isbn10ToIsbn13(isbn10: string): string {
  const body = isbn10.slice(0, 9).toUpperCase()
  const core = `978${body}`
  return core + isbn13CheckDigit(core)
}

/**
 * Returns a 13-digit ISBN suitable for lookup when possible, else null.
 * Accepts raw scanner text (digits, spaces, hyphens).
 */
export function normalizeIsbnForLookup(raw: string): string | null {
  const cleaned = raw.trim().toUpperCase().replace(/[^0-9X]/g, '')
  if (cleaned.length === 13 && /^\d{13}$/.test(cleaned)) {
    return isValidIsbn13(cleaned) ? cleaned : null
  }
  if (cleaned.length === 10 && /^\d{9}[\dX]$/i.test(cleaned)) {
    if (!isValidIsbn10(cleaned)) return null
    return isbn10ToIsbn13(cleaned)
  }
  return null
}

function joinNames(items: Array<OpenLibraryNamed> | undefined, max: number): string {
  if (!items?.length) return ''
  return items
    .map((x) => (typeof x.name === 'string' ? x.name.trim() : ''))
    .filter(Boolean)
    .slice(0, max)
    .join('; ')
}

function subjectNames(
  subjects: Array<OpenLibraryNamed> | undefined,
  maxSubjects: number,
): string {
  if (!subjects?.length) return ''
  return subjects
    .map((s) => (typeof s.name === 'string' ? s.name.trim() : ''))
    .filter(Boolean)
    .slice(0, maxSubjects)
    .join('; ')
}

function isbn13FromRecord(
  record: OpenLibraryBookEntry | null,
  fallbackIsbn13: string | null,
): string {
  if (record === null) return fallbackIsbn13 ?? ''
  const identifiers = record.identifiers
  if (identifiers === undefined) return fallbackIsbn13 ?? ''
  const isbn13List = identifiers.isbn_13
  const from13 = Array.isArray(isbn13List) ? isbn13List[0] : undefined
  if (typeof from13 === 'string' && /^\d{13}$/.test(from13)) return from13
  const isbn10List = identifiers.isbn_10
  const from10 = Array.isArray(isbn10List) ? isbn10List[0] : undefined
  if (typeof from10 === 'string' && isValidIsbn10(from10.toUpperCase())) {
    return isbn10ToIsbn13(from10.toUpperCase())
  }
  return fallbackIsbn13 ?? ''
}

function firstEntry(json: OpenLibraryBooksJson): OpenLibraryBookEntry | null {
  const keys = Object.keys(json)
  const k = keys.at(0)
  if (k === undefined) return null
  const first = json[k]
  return first !== undefined && typeof first === 'object' ? first : null
}

const olFetchCache = new Map<string, Promise<OpenLibraryBookEntry | null>>()

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
    return await fetch(url, { signal: ctrl.signal })
  } finally {
    clearTimeout(t)
    if (signal) signal.removeEventListener('abort', onAbort)
  }
}

/**
 * Fetch edition data by ISBN (prefer normalized 13-digit string).
 * Results are cached per process for duplicate scans.
 */
export async function fetchOpenLibraryByIsbn(
  isbn13: string,
  options?: { signal?: AbortSignal },
): Promise<OpenLibraryBookEntry | null> {
  const key = isbn13
  const hit = olFetchCache.get(key)
  if (hit) return hit

  const url = `${OPEN_LIBRARY_BOOKS}&bibkeys=${encodeURIComponent(`ISBN:${isbn13}`)}`
  const promise = (async () => {
    try {
      const res = await fetchWithTimeout(url, options?.signal)
      if (!res.ok) return null
      const json = (await res.json()) as OpenLibraryBooksJson
      return firstEntry(json)
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') throw e
      return null
    }
  })()

  olFetchCache.set(key, promise)
  try {
    const result = await promise
    if (result === null) olFetchCache.delete(key)
    return result
  } catch (e) {
    olFetchCache.delete(key)
    throw e
  }
}

/** Remove newlines and separator chars so one logical row/column stays intact. */
export function sanitizeBookCell(
  value: string,
  separator: BookEnrichSeparator,
): string {
  return sanitizeEnrichmentCell(value, separator)
}

export function bookRecordToFieldValues(
  record: OpenLibraryBookEntry | null,
  fieldIds: Array<BookFieldId>,
  scannedCode: string,
  normalizedIsbn13: string | null,
  separator: BookEnrichSeparator,
  options?: { subjectsMax?: number },
): Array<string> {
  const subjectsMax = options?.subjectsMax ?? 5
  const isbn13 = isbn13FromRecord(record, normalizedIsbn13)

  return fieldIds.map((id) => {
    let raw = ''
    switch (id) {
      case 'scannedCode':
        raw = scannedCode
        break
      case 'title':
        raw = record?.title ?? ''
        break
      case 'authors':
        raw = joinNames(record?.authors, 50)
        break
      case 'publishers':
        raw = joinNames(record?.publishers, 20)
        break
      case 'publishDate':
        raw = record?.publish_date ?? ''
        break
      case 'pageCount': {
        const n = record?.number_of_pages
        raw = typeof n === 'number' && Number.isFinite(n) ? String(n) : ''
        break
      }
      case 'publishPlaces':
        raw = joinNames(record?.publish_places, 20)
        break
      case 'subjects':
        raw = subjectNames(record?.subjects, subjectsMax)
        break
      case 'openLibraryUrl':
        raw = record?.url ?? ''
        break
      case 'isbn13':
        raw = isbn13
        break
    }
    return sanitizeBookCell(raw, separator)
  })
}

export function joinBookFieldValues(
  values: Array<string>,
  separator: BookEnrichSeparator,
): string {
  return joinEnrichmentFieldValues(values, separator)
}

export type ResolveOpenLibraryLineResult = {
  line: string
  /** True when Open Library returned an edition for the ISBN */
  found: boolean
  /** Field values after sanitization (same order as fieldIds) */
  values: Array<string>
}

/**
 * Normalize ISBN, fetch Open Library, map selected fields, join with separator.
 */
export async function resolveOpenLibraryEnrichmentLine(
  scannedCode: string,
  fieldIds: Array<BookFieldId>,
  separator: BookEnrichSeparator,
  options?: { signal?: AbortSignal },
): Promise<ResolveOpenLibraryLineResult> {
  if (fieldIds.length === 0) {
    return { line: '', found: false, values: [] }
  }

  const isbn = normalizeIsbnForLookup(scannedCode)
  if (!isbn) {
    const values = bookRecordToFieldValues(
      null,
      fieldIds,
      scannedCode,
      null,
      separator,
    )
    return {
      line: joinBookFieldValues(values, separator),
      found: false,
      values,
    }
  }

  const record = await fetchOpenLibraryByIsbn(isbn, options)
  const found = record !== null
  const values = bookRecordToFieldValues(
    record,
    fieldIds,
    scannedCode,
    isbn,
    separator,
  )
  return {
    line: joinBookFieldValues(values, separator),
    found,
    values,
  }
}
