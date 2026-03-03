/**
 * Generate favicon PNGs from public/favicon.svg.
 * Run from apps/web: node scripts/generate-favicons.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const svgPath = join(publicDir, 'favicon.svg')

const svg = readFileSync(svgPath)

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
]

await Promise.all(
  sizes.map(async ({ name, size }) => {
    const outPath = join(publicDir, name)
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(outPath)
    console.log(`Wrote ${name} (${size}x${size})`)
  }),
)

console.log('Favicons generated.')
