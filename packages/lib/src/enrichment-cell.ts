/** Shared tabular cell sanitization for desk enrichment (books, Open * Facts, etc.) */

export type EnrichSeparator = '\t' | ','

/** Remove newlines and separator chars so one logical row/column stays intact. */
export function sanitizeEnrichmentCell(
  value: string,
  separator: EnrichSeparator,
): string {
  let s = value.replace(/\r\n/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ')
  if (separator === '\t') s = s.replace(/\t/g, ' ')
  else s = s.replace(/,/g, ' ')
  return s.trim()
}

export function joinEnrichmentFieldValues(
  values: Array<string>,
  separator: EnrichSeparator,
): string {
  return values.join(separator)
}
