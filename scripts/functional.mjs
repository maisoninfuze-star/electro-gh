/**
 * FUNCTIONAL TESTS
 * ================
 * Exercises the things that silently break on catalogue sites: filters that
 * update a count but don't hide anything, a card price that disagrees with the
 * product page, a language switch that dumps you on the homepage, and search
 * that can't cope with a missing accent.
 *
 *   node scripts/functional.mjs [baseUrl]
 */
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2] || 'http://localhost:3320';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--hide-scrollbars', '--disable-gpu'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 950 });

const settle = (ms = 800) => new Promise((r) => setTimeout(r, ms));

/* ── 1. Filters actually filter ─────────────────────────────────────────── */
await page.goto(`${BASE}/magasiner`, { waitUntil: 'networkidle2' });
await settle(1200);

const countCards = () => page.evaluate(() => document.querySelectorAll('article').length);
const statedCount = () =>
  page.evaluate(() => {
    const p = [...document.querySelectorAll('p')].find((e) => /\d+\s+produits?/.test(e.textContent));
    return p ? parseInt(p.textContent, 10) : -1;
  });

const allCards = await countCards();
const allStated = await statedCount();
check('shop: stated count matches rendered cards', allCards === allStated, `${allStated} stated / ${allCards} rendered`);

// Tick the first brand facet.
const brandLabel = await page.evaluate(() => {
  const groups = [...document.querySelectorAll('aside h3 button')];
  const brandBtn = groups.find((b) => /marque/i.test(b.textContent));
  const group = brandBtn?.closest('div');
  const first = group?.querySelector('ul label');
  const text = first?.querySelector('span:nth-child(2)')?.textContent?.trim();
  first?.querySelector('input')?.click();
  return text;
});
await settle(900);

const filteredCards = await countCards();
const filteredStated = await statedCount();
check('shop: brand filter reduces the grid', filteredCards < allCards && filteredCards > 0,
  `${brandLabel}: ${allCards} -> ${filteredCards}`);
check('shop: filtered count matches rendered cards', filteredCards === filteredStated,
  `${filteredStated} stated / ${filteredCards} rendered`);

const allSameBrand = await page.evaluate((brand) =>
  [...document.querySelectorAll('article')].every((a) =>
    a.textContent.toLowerCase().includes(String(brand).toLowerCase())), brandLabel);
check('shop: every remaining card is that brand', allSameBrand, String(brandLabel));

check('shop: filter state is in the URL', page.url().includes('b='), page.url().replace(BASE, ''));

/* ── 2. Reloading the filtered URL restores the same result set ─────────── */
const filteredUrl = page.url();
await page.goto(filteredUrl, { waitUntil: 'networkidle2' });
await settle(1200);
check('shop: filtered URL is shareable', (await countCards()) === filteredCards,
  `${await countCards()} after reload / ${filteredCards} before`);

/* ── 3. Card price === product page price ──────────────────────────────── */
await page.goto(`${BASE}/aubaines`, { waitUntil: 'networkidle2' });
await settle(1200);

const sample = await page.evaluate(() =>
  [...document.querySelectorAll('article')].slice(0, 6).map((a) => ({
    href: a.querySelector('h3 a')?.getAttribute('href'),
    name: a.querySelector('h3 a')?.textContent?.trim(),
    price: a.querySelector('.tnum.font-display')?.textContent?.trim(),
  })));

let mismatches = 0;
for (const item of sample) {
  await page.goto(BASE + item.href, { waitUntil: 'networkidle2' });
  await settle(500);
  const pdp = await page.evaluate(
    () => document.querySelector('.tnum.font-display')?.textContent?.trim(),
  );
  if (pdp !== item.price) {
    mismatches++;
    console.log(`      MISMATCH ${item.name}: card ${item.price} vs page ${pdp}`);
  }
}
check(`deals: card price equals product page price (${sample.length} sampled)`, mismatches === 0);

/* ── 4. Language switch keeps you on the same page ─────────────────────── */
await page.goto(`${BASE}/refrigerateurs`, { waitUntil: 'networkidle2' });
await settle(800);
await page.evaluate(() => {
  const a = [...document.querySelectorAll('header a')].find((x) => x.textContent.trim() === 'EN');
  a?.click();
});
await settle(1500);
check('i18n: FR category -> matching EN category', page.url().endsWith('/en/refrigerators'),
  page.url().replace(BASE, ''));

/* ── 5. Accent-insensitive search ──────────────────────────────────────── */
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
await settle(1000);
await page.evaluate(() => {
  const b = [...document.querySelectorAll('header button')].find((x) => (x.getAttribute('aria-label') || '').match(/recherch|search/i));
  b?.click();
});
await settle(600);
await page.type('input[type="search"]', 'secheuse');
await settle(700);
const hitsNoAccent = await page.evaluate(() => document.querySelectorAll('[role="dialog"] li a').length);
check('search: "secheuse" (no accents) finds sécheuses', hitsNoAccent > 0, `${hitsNoAccent} results`);

await page.evaluate(() => { const i = document.querySelector('input[type="search"]'); i.value=''; });
await page.type('input[type="search"]', 'samsung washer');
await settle(700);
const hitsBilingual = await page.evaluate(() => document.querySelectorAll('[role="dialog"] li a').length);
check('search: bilingual query "samsung washer" matches', hitsBilingual > 0, `${hitsBilingual} results`);

/* ── 6. Contact affordances are real ───────────────────────────────────── */
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
await settle(600);
const contacts = await page.evaluate(() => ({
  tels: [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href')),
  telCount: document.querySelectorAll('a[href^="tel:"]').length,
  maps: document.querySelectorAll('a[href*="google.com/maps"]').length,
  whatsapp: document.querySelectorAll('a[href*="wa.me"]').length,
}));
// Two stores: BOTH numbers must be reachable as real tel: links, and nothing
// on the page may dial a number that isn't one of the two.
check('contact: both store tel: links present',
  contacts.tels.includes('tel:+15143322848') && contacts.tels.includes('tel:+14506812848'),
  `${contacts.telCount} link(s): ${[...new Set(contacts.tels)].join(', ')}`);
check('contact: no tel: link to an unknown number',
  contacts.tels.every((t) => t === 'tel:+15143322848' || t === 'tel:+14506812848'),
  [...new Set(contacts.tels)].join(', '));
check('contact: directions links present', contacts.maps > 0, `${contacts.maps} link(s)`);
check('contact: WhatsApp hidden while unverified', contacts.whatsapp === 0,
  `${contacts.whatsapp} wa.me link(s)`);

/* ── 6b. Two-store chooser ─────────────────────────────────────────────── */
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
await settle(500);
await page.click('div.fixed.inset-x-0.bottom-0 button');
await settle(500);
const chooser = await page.evaluate(() => {
  const d = document.querySelector('[role="dialog"][aria-labelledby="store-chooser-title"]');
  return {
    open: !!d,
    rows: d ? [...d.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href')) : [],
  };
});
check('chooser: mobile "Appeler" opens the two-store sheet', chooser.open);
check('chooser: sheet offers both stores as tel: links',
  chooser.rows.includes('tel:+15143322848') && chooser.rows.includes('tel:+14506812848'),
  chooser.rows.join(', '));
await page.keyboard.press('Escape');
await page.setViewport({ width: 1440, height: 900 });

/* ── 7. Structured data ────────────────────────────────────────────────── */
await page.goto(`${BASE}/laveuses/laveuse-samsung-a-chargement-par-le-haut-blanc`, { waitUntil: 'networkidle2' });
await settle(600);
const ld = await page.evaluate(() =>
  [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent)));
// Flatten @graph so the two Store nodes are visible alongside top-level nodes.
const nodes = ld.flatMap((x) => (Array.isArray(x['@graph']) ? x['@graph'] : [x]));
const product = nodes.find((x) => x['@type'] === 'Product');
const stores = nodes.filter((x) => Array.isArray(x['@type']) && x['@type'].includes('Store'));
const org = nodes.find((x) => x['@type'] === 'Organization');
check('schema: Product + Offer emitted', !!product?.offers?.price, `price ${product?.offers?.price} ${product?.offers?.priceCurrency}`);
check('schema: Breadcrumb emitted', nodes.some((x) => x['@type'] === 'BreadcrumbList'));
check('schema: two Store nodes, each with its own phone',
  stores.length === 2 &&
    stores.some((s) => s.telephone === '+15143322848' && s.address?.addressLocality === 'Montréal') &&
    stores.some((s) => s.telephone === '+14506812848' && s.address?.addressLocality === 'Laval'),
  stores.map((s) => `${s.address?.addressLocality}:${s.telephone}`).join(' '));
check('schema: Organization with verified email', org?.email === 'electrogh@hotmail.com', org?.email);
check('schema: no invented aggregateRating', !product?.aggregateRating && !stores.some((s) => s.aggregateRating));
check('schema: no invented opening hours', !stores.some((s) => s.openingHoursSpecification));

await browser.close();

const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} functional checks passed`);
process.exit(failed ? 1 : 0);
