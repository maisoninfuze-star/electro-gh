#!/usr/bin/env node
/**
 * STUDIO IMAGE CLI
 * ================
 * Batch-converts real Electro GH shop-floor photographs into e-commerce-ready
 * studio images via fal.ai, then optimises them into the /public/media folder.
 *
 *   FAL_KEY=... node scripts/studio-images.mjs ./raw-photos
 *   FAL_KEY=... node scripts/studio-images.mjs ./raw-photos --dry-run
 *
 * Naming convention for input files — the appliance type is read from the
 * filename so the relight prompt can describe the right object:
 *
 *   GH-RF-1041_refrigerator.jpg   ->  public/media/products/gh-rf-1041-1.webp
 *   GH-WA-2051_washer_2.jpg       ->  public/media/products/gh-wa-2051-2.webp
 *
 * The SKU prefix links the output straight back to a row in the product feed.
 *
 * ── WHAT THIS DOES NOT DO ────────────────────────────────────────────────
 * It never regenerates the appliance. See lib/fal/pipeline.ts for why: the
 * photo is the product description for a used or open-box unit, so a model
 * that "improves" a control panel creates a return, not a better photo.
 */
import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { PROMPTS, FAL_ENDPOINTS } from '../lib/fal/pipeline.ts';

const run = promisify(execFile);

const SRC = process.argv[2];
const DRY = process.argv.includes('--dry-run');
const OUT = path.join(process.cwd(), 'public', 'media', 'products');

if (!SRC) {
  console.error('usage: FAL_KEY=... node scripts/studio-images.mjs <source-dir> [--dry-run]');
  process.exit(1);
}
if (!process.env.FAL_KEY && !DRY) {
  console.error(
    'FAL_KEY is not set.\n' +
      'Put it in a .env.local that is NOT committed, or export it for this shell only.',
  );
  process.exit(1);
}

/** Filename token -> the noun handed to the relight prompt. */
const TYPE_WORDS = {
  refrigerator: 'stainless steel refrigerator',
  fridge: 'refrigerator',
  washer: 'front load washing machine',
  dryer: 'clothes dryer',
  set: 'matching washer and dryer pair',
  range: 'kitchen range with an oven',
  stove: 'kitchen range with an oven',
  dishwasher: 'dishwasher',
  freezer: 'freezer',
};

function describe(filename) {
  const lower = filename.toLowerCase();
  for (const [token, phrase] of Object.entries(TYPE_WORDS)) {
    if (lower.includes(token)) return phrase;
  }
  return 'home appliance';
}

/** GH-RF-1041_refrigerator_2.jpg -> { sku: 'gh-rf-1041', index: 2 } */
function parseName(filename) {
  const base = path.basename(filename, path.extname(filename));
  const [skuPart, ...rest] = base.split('_');
  const trailing = rest[rest.length - 1];
  const index = /^\d+$/.test(trailing ?? '') ? Number(trailing) : 1;
  return { sku: skuPart.toLowerCase(), index };
}

async function falUpload(filePath, key) {
  const bytes = await import('node:fs').then((fs) => fs.promises.readFile(filePath));
  const res = await fetch('https://fal.run/storage/upload', {
    method: 'POST',
    headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/octet-stream' },
    body: bytes,
  });
  if (!res.ok) throw new Error(`upload failed: ${res.status}`);
  const { url } = await res.json();
  return url;
}

async function falRun(endpoint, input, key) {
  const submit = await fetch(`https://queue.fal.run/${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!submit.ok) throw new Error(`${endpoint} submit ${submit.status}`);
  const { status_url, response_url } = await submit.json();

  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const s = await fetch(status_url, { headers: { Authorization: `Key ${key}` } });
    const body = await s.json();
    if (body.status === 'COMPLETED') break;
    if (body.status === 'FAILED') throw new Error(`${endpoint} failed`);
  }
  const r = await fetch(response_url, { headers: { Authorization: `Key ${key}` } });
  const json = await r.json();
  const url = json.image?.url ?? json.images?.[0]?.url;
  if (!url) throw new Error(`${endpoint} returned no image`);
  return url;
}

/** cwebp is used when present; otherwise the PNG is kept as-is. */
async function optimise(pngPath, webpPath) {
  try {
    await run('cwebp', ['-quiet', '-q', '82', '-resize', '1400', '0', '-m', '6', pngPath, '-o', webpPath]);
    return webpPath;
  } catch {
    console.warn('  cwebp not found — keeping PNG. Install with: brew install webp');
    return pngPath;
  }
}

const key = process.env.FAL_KEY;
await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f));
if (!files.length) {
  console.error(`No images found in ${SRC}`);
  process.exit(1);
}

console.log(`${files.length} source photo(s) -> ${OUT}\n`);

for (const file of files) {
  const full = path.join(SRC, file);
  const { sku, index } = parseName(file);
  const applianceType = describe(file);
  const outName = `${sku}-${index}`;

  console.log(`· ${file}`);
  console.log(`    sku=${sku}  index=${index}  type="${applianceType}"`);

  if (DRY) {
    console.log(`    would write ${path.join(OUT, outName + '.webp')}`);
    console.log(`    relight prompt: ${PROMPTS.relight(applianceType).slice(0, 90)}…\n`);
    continue;
  }

  try {
    const { size } = await stat(full);
    console.log(`    uploading (${(size / 1024 / 1024).toFixed(1)} MB)…`);
    let url = await falUpload(full, key);

    console.log('    removing background…');
    url = await falRun(FAL_ENDPOINTS.removeBackground, { image_url: url }, key);

    console.log('    normalising lighting…');
    url = await falRun(
      FAL_ENDPOINTS.relight,
      { image_url: url, prompt: PROMPTS.relight(applianceType), strength: 0.25 },
      key,
    );

    const png = path.join(OUT, `${outName}.png`);
    const webp = path.join(OUT, `${outName}.webp`);
    const bin = Buffer.from(await (await fetch(url)).arrayBuffer());
    await writeFile(png, bin);
    const final = await optimise(png, webp);
    if (final === webp) await import('node:fs').then((fs) => fs.promises.unlink(png));

    console.log(`    ✓ ${path.relative(process.cwd(), final)}\n`);
  } catch (err) {
    console.error(`    ✗ ${err.message}\n`);
  }
}

console.log(
  'Done. Reference the outputs from the product feed as:\n' +
    "  images: [{ src: '/media/products/<sku>-1.webp', alt: '…', width: 1400, height: 1400, kind: 'studio' }]",
);
