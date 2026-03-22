/**
 * Grab a center square from the live camera frame for OCR (matches ~html5-qrcode qrbox ratio).
 * Downscales large crops for faster Tesseract runs on phones.
 */
export function captureCenterSquareFromVideo(
  video: HTMLVideoElement,
  cropRatio: number,
  maxOutputSide = 1280,
): HTMLCanvasElement {
  const vw = video.videoWidth
  const vh = video.videoHeight
  if (vw <= 0 || vh <= 0) {
    throw new Error('Video has no frame yet')
  }
  const cap = Math.max(Math.min(vw, vh), 1)
  const target = Math.round(cap * cropRatio)
  const side = Math.min(Math.max(target, 160), Math.floor(cap * 0.92))
  const sx = Math.floor((vw - side) / 2)
  const sy = Math.floor((vh - side) / 2)

  const outSide = Math.min(side, maxOutputSide)

  const canvas = document.createElement('canvas')
  canvas.width = outSide
  canvas.height = outSide
  const ctx = canvas.getContext('2d')
  if (ctx === null) {
    throw new Error('Canvas is not supported')
  }
  ctx.drawImage(video, sx, sy, side, side, 0, 0, outSide, outSide)
  return canvas
}
