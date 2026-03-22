/**
 * Browser-only Tesseract entry. Kept in a leaf module with `vite-ignore` so SSR/Nitro
 * does not try to bundle `tesseract.js` (it pulls browser + Node paths that break Rollup).
 */
export type TesseractWorker = {
  recognize: (
    image: HTMLCanvasElement,
    options?: Record<string, unknown>,
  ) => Promise<{ data: { text: string } }>
  terminate: () => Promise<unknown>
}

export async function createEngTesseractWorker(): Promise<TesseractWorker> {
  const { createWorker } = await import(
    /* @vite-ignore */
    'tesseract.js'
  )
  return createWorker('eng') as Promise<TesseractWorker>
}
