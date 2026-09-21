/**
 * ADMIN END-TO-END
 * ================
 * Drives the admin exactly as the owner would, on a phone-sized viewport,
 * against a running `next start` with ADMIN_PASSWORD=electrogh-dev, and
 * checks the PUBLIC site after every write. This is the "linked A to Z"
 * guarantee: if any link in the chain breaks, this fails.
 *
 *   npm run build && ADMIN_PASSWORD=electrogh-dev npx next start -p 3320 &
 *   npm run test:admin
 *
 * Snapshots data/inventory.json before starting and restores it at the end,
 * so the suite leaves the seed exactly as it found it.
 */
import puppeteer from 'puppeteer-core';
import { copyFile, readFile, rm } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.BASE ?? 'http://localhost:3320';
const PASSWORD = process.env.ADMIN_PASSWORD ?? 'electrogh-dev';
const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SNAPSHOT = 'data/.inventory.e2e-snapshot.json';
await copyFile('data/inventory.json', SNAPSHOT);

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--hide-scrollbars', '--disable-gpu'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => console.log('   [pageerror]', e.message));

try {
  /* ── 1. Gate ─────────────────────────────────────────────────────── */
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle2' });
  check('gate: /admin without session lands on login', page.url().endsWith('/admin/login'), page.url());

  await page.type('input[name="password"]', 'wrong-password');
  await page.click('button[type="submit"]');
  await sleep(1200);
  const wrongMsg = await page.$eval('[role="alert"]', (el) => el.textContent).catch(() => '');
  check('gate: wrong password is refused', page.url().endsWith('/admin/login') && /incorrect/i.test(wrongMsg), wrongMsg);

  await page.$eval('input[name="password"]', (el) => (el.value = ''));
  await page.type('input[name="password"]', PASSWORD);
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), page.click('button[type="submit"]')]);
  check('gate: correct password reaches the inventory', /\/admin\/?$/.test(page.url()), page.url());

  /* ── 2. Seed shows: 10 published, 6 drafts ───────────────────────── */
  const counts = await page.$eval('main p', (el) => el.textContent);
  check('list: header counts read 10 en ligne · 6 brouillons', /10 en ligne · 6 brouillons/.test(counts), counts);

  await page.goto(`${BASE}/admin?status=draft`, { waitUntil: 'networkidle2' });
  const draftRows = await page.$$eval('main ul > li', (els) => els.length);
  check('list: drafts tab shows 6 rows', draftRows === 6, `${draftRows} rows`);
  const missing = await page.$$eval('main ul > li', (els) => els.filter((e) => /Manque : prix/.test(e.textContent)).length);
  check('list: 5 drafts flag "Manque : prix"', missing === 5, `${missing}`);
  const disabled = await page.$$eval('main ul > li button', (els) => els.filter((b) => b.disabled && /Publier/.test(b.textContent)).length);
  check('list: Publier is disabled on drafts without price', disabled === 5, `${disabled} disabled`);

  /* ── 3. Create a product with a photo, from the form ─────────────── */
  await page.goto(`${BASE}/admin/produits/nouveau`, { waitUntil: 'networkidle2' });
  const fileInput = await page.$('input[type="file"][capture]');
  await fileInput.uploadFile(path.resolve('data/photos/raw/14.jpg'));
  await page.waitForFunction(() => document.querySelectorAll('figure img').length === 1, { timeout: 30000 });
  const uploaded = await page.$eval('input[name="images"]', (el) => JSON.parse(el.value));
  check('form: photo uploads and lands in the images field', uploaded.length === 1 && /\/uploads\/gh-.*\.webp$/.test(uploaded[0].src), uploaded[0]?.src);
  const uploadedFile = uploaded[0].src;
  const dims = await page.evaluate(async (src) => {
    const img = new Image(); img.src = src; await img.decode(); return { w: img.naturalWidth, h: img.naturalHeight };
  }, uploadedFile);
  check('form: upload resized to ≤1600×2000 WebP', dims.w <= 1600 && dims.h <= 2000, `${dims.w}×${dims.h}`);

  await page.type('input[name="brand"]', 'Bosch');
  await page.select('select[name="category"]', 'dishwashers');
  await page.type('input[name="nameFr"]', 'Lave-vaisselle test E2E, inox');
  await page.type('input[name="price"]', '345');
  await page.click('input[name="status"][value="published"]');
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}), page.click('#product-form button[type="submit"]')]);
  await sleep(600);
  check('form: create redirects to the list', /\/admin\/?$/.test(page.url()), page.url());
  const found = await page.$$eval('main ul > li', (els) => els.some((e) => /Lave-vaisselle test E2E/.test(e.textContent)));
  check('list: new product appears', found);

  /* ── 4. Public site reflects it immediately ──────────────────────── */
  const pub = await page.goto(`${BASE}/lave-vaisselle`, { waitUntil: 'networkidle2' });
  const onPublic = await page.evaluate(() => document.body.innerText.includes('Lave-vaisselle test E2E'));
  check('public: new product is on /lave-vaisselle', pub.status() === 200 && onPublic);
  const cardPrice = await page.$$eval('article', (els) => {
    const a = els.find((x) => /Lave-vaisselle test E2E/.test(x.textContent));
    return a ? a.textContent.match(/\d[\d\s\u00a0\u202f]*\$/)?.[0]?.replace(/[\s\u00a0\u202f]/g, '') : null;
  });
  check('public: card shows 345 $', cardPrice === '345$', cardPrice);

  /* ── 5. Edit: change the price, verify the public page follows ───── */
  await page.goto(`${BASE}/admin?q=E2E`, { waitUntil: 'networkidle2' });
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), page.click('main ul > li a[href^="/admin/produits/"]')]);
  const editUrl = page.url();
  check('edit: row opens the edit form', /\/admin\/produits\/p_/.test(editUrl), editUrl);
  await page.$eval('input[name="price"]', (el) => (el.value = ''));
  await page.type('input[name="price"]', '299');
  await page.click('#product-form button[type="submit"]');
  await page.waitForFunction(() => /Enregistré/.test(document.body.innerText), { timeout: 15000 });
  check('edit: save confirms "Enregistré."', true);

  await page.goto(`${BASE}/lave-vaisselle`, { waitUntil: 'networkidle2' });
  const price2 = await page.$$eval('article', (els) => {
    const a = els.find((x) => /Lave-vaisselle test E2E/.test(x.textContent));
    return a ? a.textContent.match(/\d[\d\s\u00a0\u202f]*\$/)?.[0]?.replace(/[\s\u00a0\u202f]/g, '') : null;
  });
  check('public: edited price 299 $ is live on the next request', price2 === '299$', price2);

  const productLink = await page.$$eval('a', (as) => as.find((x) => /Lave-vaisselle test E2E/.test(x.textContent))?.getAttribute('href'));
  const pp = await page.goto(`${BASE}${productLink}`, { waitUntil: 'networkidle2' });
  check('public: product page renders (200)', pp.status() === 200, productLink);

  /* ── 6. Mark sold from the list → disappears publicly ────────────── */
  await page.goto(`${BASE}/admin?q=E2E`, { waitUntil: 'networkidle2' });
  const soldBtn = await page.$$('main ul > li button');
  const vendu = (await Promise.all(soldBtn.map(async (b) => ((await b.evaluate((e) => e.textContent)).includes('Vendu') ? b : null)))).find(Boolean);
  await vendu.click();
  await page.waitForFunction(() => /Vendu/.test(document.querySelector('main ul > li')?.textContent ?? '') && !/Marquer/.test(document.body.innerText), { timeout: 10000 });
  await sleep(500);
  const chip = await page.$eval('main ul > li', (el) => el.textContent);
  check('sold: one tap marks the unit Vendu', /VENDU|Vendu/.test(chip));

  const gone = await page.goto(`${BASE}${productLink}`, { waitUntil: 'networkidle2' });
  check('public: sold product page is a 404', gone.status() === 404, `status ${gone.status()}`);
  await page.goto(`${BASE}/lave-vaisselle`, { waitUntil: 'networkidle2' });
  const stillListed = await page.evaluate(() => document.body.innerText.includes('Lave-vaisselle test E2E'));
  check('public: sold product is off the category page', !stillListed);

  /* ── 7. Delete removes the record and its file ───────────────────── */
  await page.goto(editUrl, { waitUntil: 'networkidle2' });
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /Supprimer/.test(b.textContent)).click());
  await sleep(300);
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Oui').click())]);
  await sleep(500);
  const raw = JSON.parse(await readFile('data/inventory.json', 'utf8'));
  check('delete: record removed from the store', !raw.products.some((p) => /E2E/.test(p.name.fr)));
  // Check the disk, not the browser: the upload route sends `immutable`, so a
  // page.goto would happily answer 200 from Chrome's cache.
  const { access } = await import('node:fs/promises');
  const stillOnDisk = await access(path.join('data/uploads', path.basename(uploadedFile))).then(() => true, () => false);
  check('delete: uploaded photo file deleted too', !stillOnDisk, path.basename(uploadedFile));

  /* ── 8. Logout ends the session ──────────────────────────────────── */
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle2' });
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), page.click('button[aria-label="Déconnexion"]')]);
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle2' });
  check('logout: /admin redirects to login again', page.url().endsWith('/admin/login'));
} finally {
  await browser.close();
  await copyFile(SNAPSHOT, 'data/inventory.json');
  await rm(SNAPSHOT, { force: true });
}

const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} admin checks passed`);
process.exit(failed ? 1 : 0);
