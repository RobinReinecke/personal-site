// Renders the brand SVGs in brand/svg/ to PNGs and a favicon.ico, and copies the icons the site
// uses into public/ and src/assets/. Run with `pnpm brand:export` after editing an SVG.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

interface SharpPipeline {
  resize(width: number, height: number): SharpPipeline;
  png(): SharpPipeline;
  toBuffer(): Promise<Buffer>;
}

// sharp is not a direct dependency: borrow the copy Astro already installs for image processing.
const requireFromAstro = createRequire(
  createRequire(import.meta.url).resolve('astro/package.json')
);
const sharp = requireFromAstro('sharp') as (
  input: string,
  options: { density: number }
) => SharpPipeline;

const SVG_DIR = 'brand/svg';
const PNG_DIR = 'brand/png';

// All brand SVGs use a 128x128 viewBox; rasterise at the target density so edges stay crisp.
function render(name: string, size: number): Promise<Buffer> {
  return sharp(`${SVG_DIR}/${name}.svg`, { density: (72 * size) / 128 })
    .resize(size, size)
    .png()
    .toBuffer();
}

// Minimal ICO container with embedded PNGs (supported by every browser that still asks for .ico).
function toIco(images: { size: number; png: Buffer }[]): Buffer {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const entry = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt16LE(1, entry + 4); // colour planes
    header.writeUInt16LE(32, entry + 6); // bits per pixel
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.png)]);
}

const exports: { svg: string; size: number; out: string[] }[] = [
  // Brand kit: avatars, email signatures, documents.
  ...[32, 128, 512, 1024].map((size) => ({
    svg: 'otter-face',
    size,
    out: [`${PNG_DIR}/otter-face-${size}.png`],
  })),
  { svg: 'otter-r', size: 1200, out: [`${PNG_DIR}/otter-r-1200.png`] },
  { svg: 'otter-r-dark', size: 1200, out: [`${PNG_DIR}/otter-r-dark-1200.png`] },
  // Site assets.
  {
    svg: 'otter-face-square',
    size: 180,
    out: [`${PNG_DIR}/apple-touch-icon.png`, 'public/apple-touch-icon.png'],
  },
  { svg: 'otter-r-dark', size: 192, out: ['src/assets/og-logo.png'] },
];

mkdirSync(PNG_DIR, { recursive: true });

for (const { svg, size, out } of exports) {
  const png = await render(svg, size);
  for (const path of out) {
    writeFileSync(path, png);
    console.log(`wrote ${path}`);
  }
}

const ico = toIco(
  await Promise.all(
    [16, 32, 48].map(async (size) => ({ size, png: await render('otter-face', size) }))
  )
);
for (const path of [`${PNG_DIR}/favicon.ico`, 'public/favicon.ico']) {
  writeFileSync(path, ico);
  console.log(`wrote ${path}`);
}
