# Electro GH — Électroménagers GH, Laval

Premium bilingual storefront for a local appliance retailer.
Next.js 16 · React 19 · TypeScript · Tailwind v4 · Framer Motion.

---

## The one rule this codebase enforces

**Nothing is stated about the business that has not been verified.**

Warranty durations, delivery pricing, financing terms, opening hours, company
history, brand lists and product specifications were **not supplied**, so none
of them appear anywhere. They are modelled as `Verified<T>` fields in
[`content/business.ts`](content/business.ts) that are `null` until someone fills
them in. Components read the flag and either render the fact or render an honest
"call us to confirm" — they never guess.

Fill one in and it appears site-wide, including in the schema.org output. That
is the whole mechanism.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build — this is exactly what Vercel runs |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run qa` | Responsive + a11y sweep at 7 breakpoints (see below) |
| `npm run test:functional` | Filters, prices, i18n, search, schema (see below) |
| `npm run test:contrast` | WCAG AA contrast on every rendered text node |
| `npm run images:studio -- ./raw-photos` | fal.ai product-photo pipeline |

> **Stop `next dev` before running `npm run build`.** They share `.next`, and a
> production build into a live dev server's directory corrupts it silently —
> the running page goes blank with no error. There is deliberately no `distDir`
> override to work around this: Vercel's output detection is happiest with the
> default, and an override there is what broke the first deploy.

---

## Where things live

```
content/business.ts        Every business fact. Verified or null. Start here.
content/site-config.ts     Behaviour switches (primary product CTA, etc.)

lib/i18n/config.ts         Locales, per-locale URL slugs, LIVE_ROUTES
lib/i18n/dictionaries.ts   The full FR/EN copy deck
lib/catalog/types.ts       Product data model
lib/catalog/provider.ts    ← THE ONLY PLACE THE DATA SOURCE IS DEFINED
lib/catalog/demo-products.ts  Fabricated demo catalogue (clearly flagged)
lib/catalog/filters.ts     Facets, URL serialisation, counting
lib/fal/pipeline.ts        fal.ai studio-photo pipeline + prompts
lib/analytics/events.ts    Typed conversion events

app/[locale]/                       Home
app/[locale]/[category]/            Shop, Deals, and each category
app/[locale]/[category]/[product]/  Product detail
proxy.ts                            Locale routing (Next 16 `proxy` convention)
```

---

## Bilingual architecture

French is the default and is served **without a prefix**:

| | French | English |
| --- | --- | --- |
| Home | `/` | `/en` |
| Category | `/refrigerateurs` | `/en/refrigerators` |
| Product | `/laveuses/<slug>` | `/en/washers/<slug>` |

`/fr/...` 308-redirects to the unprefixed URL so every page has exactly one
canonical address. Slugs are genuinely localised, not one language's slugs with
a prefix on top.

The copy in `dictionaries.ts` is **written, not translated** — Québec retail
register (*magasiner*, *aubaines*, *nous joindre*, *brassée*). English is a
re-write for the same intent.

**Adding Arabic** is three steps and no rebuild:
1. add `'ar'` to `LOCALES`
2. add an `ar` entry to `ROUTE_SLUGS` and to the dictionaries
3. add `'ar'` to `RTL_LOCALES` — `dir` is already wired through the layout

---

## Connecting real inventory

Everything the UI renders goes through `lib/catalog/provider.ts`. Swapping the
source is a change to **one function**:

```ts
async function loadAll(): Promise<Product[]> {
  const { data } = await supabase.from('products').select('*');
  return data.map(mapRow);
}
```

Filtering, faceting, search, sorting, related products, sitemap and schema.org
all operate on the `Product` shape and need no changes.

Then set `IS_DEMO_DATA = false` in `lib/catalog/demo-products.ts` — this removes
the demo ribbon from every page.

### Demo data

`lib/catalog/demo-products.ts` is **fabricated**. Model numbers, prices,
dimensions and stock levels describe no unit the store has ever had. Product
imagery is generic unbranded category photography (`kind: 'placeholder'`), which
is why no unit carries a manufacturer badge. A black ribbon says so on every
page while `IS_DEMO_DATA` is true.

---

## Going live — checklist

- [ ] Replace `loadAll()` with the real inventory source
- [ ] `IS_DEMO_DATA = false`
- [ ] Fill in `BUSINESS.hours` (do **not** copy from a directory unverified)
- [ ] Fill in `BUSINESS.whatsapp` — this lights up ~8 surfaces at once
- [ ] Fill in warranty / delivery terms if the owner wants them stated
- [ ] Add the real logo — see `components/layout/Logo.tsx`
- [ ] Set the brand accent in `app/globals.css` (`--color-accent`)
- [ ] Add `BUSINESS.googlePlaceId` to switch on real Google reviews
- [ ] Build Services / About / Contact, then add them to `LIVE_ROUTES`
- [ ] Set `NEXT_PUBLIC_SITE_URL`
- [ ] Set `NEXT_PUBLIC_ALLOW_INDEXING=true` — **only after sign-off**

Until that last flag is `true`, `robots.txt` disallows everything and every page
is `noindex`. Indexing a demo catalogue would put fabricated prices into Google
under the client's name.

---

## WhatsApp

Deeply wired, and currently **switched off** because no WhatsApp number was
supplied. Set `BUSINESS.whatsapp` to `v('1450...')` and the floating button, the
mobile action bar slot and the product-page CTA all appear at once — with the
product-page message prefilled:

> Bonjour Electro GH, je suis intéressé(e) par **Maytag Laveuse frontale 27 po
> MHW5630HW**. Est-il encore disponible?

A dead WhatsApp button on the mobile bar loses a real lead every time it is
tapped, so nothing renders until the number is real.

---

## fal.ai image pipeline

`lib/fal/pipeline.ts` + `scripts/studio-images.mjs`.

```
INPUT   a phone photo of an actual unit on the shop floor
        background removal → lighting normalisation → studio canvas
OUTPUT  the SAME unit on warm white with a soft contact shadow
```

Built from background removal, relighting and upscaling — **never** a
generative image-to-image pass. A model asked to "improve" an appliance will
move a dispenser or restyle a handle, and for a shop selling used and open-box
units the photo *is* the product description. Every prompt in that file is
mostly negative constraints for this reason.

Lifestyle room scenes are the one exception: they carry no product claim and are
marked `kind: 'placeholder'`.

```bash
FAL_KEY=... npm run images:studio -- ./raw-photos --dry-run
```

Name files `GH-RF-1041_refrigerator.jpg` so the SKU links back to the feed and
the appliance type reaches the relight prompt.

> Keep `FAL_KEY` in `.env.local` (git-ignored). Never commit it.

---

## QA harness

```bash
npm run build && npx next start -p 3320 &
npm run qa
```

Drives the locally installed Chrome through `puppeteer-core` (no browser
download) and checks every page at **375 / 390 / 430 / 768 / 1024 / 1440 /
1920** for horizontal overflow, sub-44px tap targets, broken images, missing
`alt`, `<h1>` count, HTTP status and console errors. Screenshots land in
`scripts/.qa-shots/`. Exits non-zero on any failure, so it drops straight into
CI. Currently **56/56**.

## Functional tests

```bash
npm run test:functional
```

Covers the things that break silently on catalogue sites:

- filters actually hide cards (not just update the count) and survive a reload
- the price on a card equals the price on the product page
- FR → EN lands on the matching page, not the homepage
- accent-insensitive and bilingual search (`refrigerateur`, `samsung fridge`)
- `tel:` / directions links are real; WhatsApp stays hidden while unverified
- Product, Offer, Breadcrumb and Store schema emitted — and **no** invented
  `aggregateRating` or `openingHoursSpecification`

Currently **18/18**.

## Contrast audit

```bash
npm run test:contrast
```

Measures every rendered text node's computed colour against its own effective
background and checks it against the AA threshold for that node's real size and
weight. Measuring the rendered page rather than the token table is the point —
it caught secondary text at 3.07:1 that looked fine by eye. Currently clean on
all seven page types.

---

## Brand

The accent is taken from the storefront sign (`brand/storefront-sign.jpg`).
The vinyl samples around `#E3384B`, which fails AA on white at 4.26:1, so
`--color-accent` is the same hue held a few steps deeper at `#C62438`
(5.66:1 on white, 5.34:1 on canvas).

Savings deliberately stay **warm bronze**, not red. If price cuts were also red
they would compete with every CTA and the site would read as a permanent sale
flyer — the one thing the brief rules out. Red is the call to action; bronze is
the value.

---

## Deploying to Vercel

`vercel.json` pins the framework and the build command:

```json
{ "framework": "nextjs", "buildCommand": "next build" }
```

Build settings in `vercel.json` take precedence over the dashboard's "Build &
Development Settings", which is the point — it makes the deploy reproducible
from the repo instead of depending on what is saved in a project's UI.

**There is deliberately no `outputDirectory` key, and no `distDir` in
`next.config.ts`.** Vercel finds `.next` on its own, and overriding either is
what produced "routes manifest could not be found" / "output directory .next
was not found" on the first attempts. If those settings are also overridden in
the dashboard, clear them — an override there is what `vercel.json` is now
guarding against.

Environment variables to set on the project:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | the production origin, e.g. `https://www.electrogh.ca` |
| `NEXT_PUBLIC_ALLOW_INDEXING` | leave unset until the client signs off; `true` to allow indexing |

---

## Known limitations

- **The store's address and phone are unconfirmed.** The brief supplied a Laval
  listing (3570 Chemin du Souvenir · 450-681-2848); the storefront photo shows
  civic number 6439 and 514.332.2848. 514 is on-island Montréal. Until the
  owner confirms which is current — or whether there are two locations — the
  site uses the brief's values unchanged. See the note on `address` in
  `content/business.ts`.
- **"Vente & achat" is not on the site.** The sign says they buy appliances as
  well as sell them; that deserves its own copy and probably its own page
  rather than being folded into a trust bullet. Recorded as
  `services.buyback` in `content/business.ts`.
- **Services / About / Contact are not built.** They are deliberately absent
  from `LIVE_ROUTES`, so nav, footer and sitemap don't link to them. Build the
  pages, then add the route ids.
- **The 404 body is client-rendered for paths that match a route shape** (e.g.
  `/laveuses/un-modele-vendu`). The status code is a correct 404 and the page
  renders normally in a browser, but the body is not in the server HTML. Truly
  unmatched paths (`/a/b/c`) do server-render. See
  `app/not-found.tsx` for the mechanism.
- **RSC prefetches log cancelled requests as 404s** in devtools. Those are the
  router aborting a prefetch, not a broken route — `npm run qa` correlates
  `requestfailed` against `response` before reporting.

---

## Conversion tracking

`lib/analytics/events.ts` pushes typed events to `window.dataLayer`:

`call_click` · `whatsapp_click` · `directions_click` · `product_view` ·
`product_inquiry` · `category_view` · `search` · `filter_used` · `lead_submit`

**No third-party JS is loaded today** — zero bytes, zero cookie banner. Install
a GTM container and the funnel is live; the names are stable, so don't rename
them once ads are running.

Product/Offer schema is already emitted on every product page, which is the feed
Google Merchant Center reads.
