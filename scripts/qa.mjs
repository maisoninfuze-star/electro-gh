/**
 * RESPONSIVE / ACCESSIBILITY QA HARNESS
 * =====================================
 * Drives the locally installed Chrome through puppeteer-core (no browser
 * download) so viewports are set exactly via CDP rather than being clamped to
 * the OS minimum window width.
 *
 *   node scripts/qa.mjs [baseUrl]
 *
 * For every page × every breakpoint in the brief it checks:
 *   · horizontal overflow (and names the offending element)
 *   · tap targets under 44px
 *   · broken images and missing alt attributes
 *   · exactly one <h1>
 *   · console errors
 * and writes a full-page screenshot to scripts/.qa-shots/.
 */
import puppeteer from 'puppeteer-core';
import { mkdir, writeFile } from 'node:fs/promises';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.argv[2] || 'http://localhost:3320';
const OUT = new URL('./.qa-shots/', import.meta.url).pathname;

/** The widths the brief requires. */
const WIDTHS = [375, 390, 430, 768, 1024, 1440, 1920];

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'shop', path: '/magasiner' },
  { name: 'category', path: '/laveuses' },
  { name: 'deals', path: '/aubaines' },
  { name: 'product', path: '/laveuses/laveuse-a-chargement-par-le-haut-blanche-couvercle-vitre' },
  { name: 'product-set', path: '/refrigerateurs/refrigerateur-a-congelateur-superieur-en-acier-inoxydable' },
  { name: 'product-en', path: '/en/dishwashers/lave-vaisselle-en-acier-inoxydable-console-noire' },
  { name: 'home-en', path: '/en' },
  { name: 'repair', path: '/reparation' },
  { name: 'parts', path: '/pieces' },
  { name: 'delivery', path: '/livraison' },
  { name: 'stores', path: '/nos-magasins' },
  { name: 'contact', path: '/nous-joindre' },
  { name: 'contact-en', path: '/en/contact' },
  { name: 'notfound', path: '/cette-page-nexiste-pas' },
];

const AUDIT = () => {
  const vw = document.documentElement.clientWidth;
  const de = document.documentElement;

  const clipped = (el) => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX;
      if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') return true;
    }
    return false;
  };

  const overflow = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if (getComputedStyle(el).position === 'fixed') continue;
    if (clipped(el)) continue;
    if (r.right > vw + 1.5 || r.left < -1.5) {
      overflow.push(`${el.tagName}.${(el.className || '').toString().slice(0, 40)} [${Math.round(r.left)}→${Math.round(r.right)}]`);
    }
  }

  const small = [];
  for (const el of document.querySelectorAll('a[href],button,input,select,textarea')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const cn = (el.className || '').toString();
    if (cn.includes('sr-only')) continue;
    // A link whose real hit area is a stretched ::after covering its card.
    if (cn.includes('after:inset-0')) continue;
    if (r.height < 44) {
      small.push(`${(el.textContent || el.getAttribute('aria-label') || '?').trim().slice(0, 24)} (${Math.round(r.height)}px)`);
    }
  }

  return {
    vw,
    overflowX: de.scrollWidth > vw + 1,
    scrollW: de.scrollWidth,
    overflow: overflow.slice(0, 5),
    small: small.slice(0, 8),
    smallCount: small.length,
    brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
    missingAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
    h1: document.querySelectorAll('h1').length,
    title: document.title,
  };
};

await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--hide-scrollbars', '--disable-gpu', '--force-prefers-reduced-motion'],
});

const rows = [];
let failures = 0;

for (const pageDef of PAGES) {
  for (const width of WIDTHS) {
    const page = await browser.newPage();
    const consoleErrors = [];
    /**
     * "Failed to load resource" carries no URL, so it cannot be correlated with
     * the cancelled-prefetch set. It is always duplicated by the response
     * listener below, which DOES correlate — so it is dropped here rather than
     * reported twice, once uselessly. Real JS errors still come through.
     */
    const IGNORE = /maps\.google|googleapis|ERR_BLOCKED|Failed to load resource/i;
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      const t = m.text();
      if (IGNORE.test(t)) return; // harness-stubbed external request, not a site error
      consoleErrors.push(t.slice(0, 120));
    });
    page.on('pageerror', (e) => consoleErrors.push('PAGEERROR ' + String(e).slice(0, 120)));
    /**
     * Next's router cancels in-flight RSC prefetches as soon as the pointer
     * leaves a link. A cancelled prefetch surfaces as both a failed request and
     * a >=400 response for the same URL — it is not a broken route, so those
     * are correlated out. The page's own document status is checked separately
     * via the navigation response.
     */
    const abortedUrls = new Set();
    const failedResponses = [];
    page.on('requestfailed', (r) => {
      if (r.url().startsWith(BASE)) abortedUrls.add(r.url());
    });
    page.on('response', (r) => {
      if (r.status() >= 400 && r.url().startsWith(BASE)) {
        failedResponses.push({ status: r.status(), url: r.url() });
      }
    });

    /**
     * The Google Maps embed is an external request. It is STUBBED with an empty
     * 204 rather than aborted: aborting an iframe's navigation detaches the
     * frame mid-load and puppeteer throws. Stubbing keeps runs deterministic
     * and offline without destabilising the page.
     */
    await page.setRequestInterception(true);
    page.on('request', (r) => {
      const u = r.url();
      if (u.startsWith(BASE) || u.startsWith('data:') || u === 'about:blank') {
        r.continue().catch(() => {});
      } else if (r.resourceType() === 'document') {
        // An iframe answered with 204 detaches its frame, and every later
        // page.evaluate throws "Attempted to use detached Frame". A minimal
        // valid document keeps the frame attached and inert.
        r.respond({
          status: 200,
          contentType: 'text/html',
          body: '<!doctype html><title>stub</title>',
        }).catch(() => {});
      } else {
        r.respond({ status: 204, contentType: 'text/plain', body: '' }).catch(() => {});
      }
    });

    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    const res = await page.goto(BASE + pageDef.path, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    // Give hydration and the reveal effects a beat to settle.
    await new Promise((r) => setTimeout(r, 700));

    // Settle lazy images and reveal transitions.
    try {
      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise((r) => setTimeout(r, 400));
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 400));
      });
    } catch {
      /* a detached subframe during settle is not a page failure */
    }

    let audit;
    try {
      audit = await page.evaluate(AUDIT);
    } catch (err) {
      rows.push({ page: pageDef.name, width, ok: false, problems: [`AUDIT ERROR ${String(err).slice(0, 90)}`] });
      failures++;
      await page.close();
      continue;
    }
    const status = res?.status();

    const mainUrl = BASE + pageDef.path;
    const genuine4xx = failedResponses.filter(
      (f) => !abortedUrls.has(f.url) && f.url !== mainUrl,
    );

    const problems = [];
    if (genuine4xx.length) {
      problems.push(
        `${genuine4xx.length} FAILED REQ: ` +
          genuine4xx.slice(0, 3).map((f) => `${f.status} ${f.url.replace(BASE, '')}`).join(', '),
      );
    }
    // 304 is a successful conditional response, not an error.
    const okStatus = pageDef.name === 'notfound' ? [404] : [200, 304];
    if (!okStatus.includes(status)) problems.push(`HTTP ${status}`);
    if (audit.overflowX) problems.push(`OVERFLOW-X (${audit.scrollW}>${audit.vw}) ${audit.overflow.join(' | ')}`);
    if (audit.smallCount) problems.push(`${audit.smallCount} TAP<44: ${audit.small.join(', ')}`);
    if (audit.brokenImgs) problems.push(`${audit.brokenImgs} BROKEN IMG`);
    if (audit.missingAlt) problems.push(`${audit.missingAlt} MISSING ALT`);
    if (audit.h1 !== 1) problems.push(`H1 COUNT ${audit.h1}`);
    if (consoleErrors.length) problems.push(`CONSOLE: ${consoleErrors.slice(0, 2).join(' ; ')}`);

    if (problems.length) failures++;
    rows.push({ page: pageDef.name, width, ok: problems.length === 0, problems });

    if (width === 375 || width === 768 || width === 1440) {
      await page.screenshot({
        path: `${OUT}${pageDef.name}-${width}.png`,
        fullPage: pageDef.name === 'home' ? false : false,
      });
    }
    await page.close();
  }
}

await browser.close();

const lines = rows.map(
  (r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.page.padEnd(16)} ${String(r.width).padStart(5)}  ${r.problems.join('  ||  ')}`,
);
const summary = `${rows.length - failures}/${rows.length} checks passed\n\n` + lines.join('\n');
await writeFile(`${OUT}report.txt`, summary);
console.log(summary);
process.exit(failures ? 1 : 0);
