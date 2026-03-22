/**
 * Regenerates raster icons from apps/web/public/icon.svg:
 * - Web: favicon PNGs, apple-touch, android-chrome, favicon.ico
 * - Desktop: runs `tauri icon` with a 1024px PNG (writes apps/desktop/src-tauri/icons/*)
 *
 * Run: npm run icons -w @scan-it/web
 */
import { execSync } from 'node:child_process'
import {
  readFileSync,
  readdirSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import toIco from 'to-ico'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const desktopDir = join(__dirname, '..', '..', 'desktop')
const tauriIconsDir = join(desktopDir, 'src-tauri', 'icons')
const svgPath = join(publicDir, 'icon.svg')

/** Strip mobile / Windows Store extras; keep only paths listed in tauri.conf.json bundle.icon. */
function pruneTauriIconOutputs() {
  for (const name of ['android', 'ios']) {
    rmSync(join(tauriIconsDir, name), { recursive: true, force: true })
  }
  let entries
  try {
    entries = readdirSync(tauriIconsDir, { withFileTypes: true })
  } catch {
    return
  }
  for (const ent of entries) {
    if (!ent.isFile()) continue
    const { name } = ent
    if (
      name.startsWith('Square') ||
      name === 'StoreLogo.png' ||
      name === '64x64.png' ||
      name === 'icon.png'
    ) {
      unlinkSync(join(tauriIconsDir, name))
    }
  }
}

function pngAtSize(size) {
  const svg = readFileSync(svgPath)
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
  })
  return Buffer.from(resvg.render().asPng())
}

async function main() {
  const png1024 = await sharp(pngAtSize(1024)).png().toBuffer()
  const tmpPng = join(tmpdir(), `scan-it-icon-1024-${Date.now()}.png`)
  writeFileSync(tmpPng, png1024)

  const outputs = [
    ['favicon-16x16.png', 16],
    ['favicon-32x32.png', 32],
    ['apple-touch-icon.png', 180],
    ['android-chrome-192x192.png', 192],
    ['android-chrome-512x512.png', 512],
  ]

  for (const [name, w] of outputs) {
    const buf = await sharp(png1024).resize(w, w).png().toBuffer()
    writeFileSync(join(publicDir, name), buf)
  }

  const buf16 = await sharp(png1024).resize(16, 16).png().toBuffer()
  const buf32 = await sharp(png1024).resize(32, 32).png().toBuffer()
  const ico = await toIco([buf16, buf32])
  writeFileSync(join(publicDir, 'favicon.ico'), ico)

  try {
    execSync(`npx tauri icon "${tmpPng}"`, {
      cwd: desktopDir,
      stdio: 'inherit',
      shell: true,
    })
    pruneTauriIconOutputs()
  } finally {
    try {
      unlinkSync(tmpPng)
    } catch {
      // ignore
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
