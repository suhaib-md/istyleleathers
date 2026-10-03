# Launch report — I Style Leathers

**Audited:** 3 Oct 2026 · **Target:** local production build (`next build` + `next start`), built the way Vercel builds it · **Stack:** Next.js 16.3 (App Router, Turbopack), React 19, Tailwind 4, GSAP, three.js
**Scope:** speed and Vercel readiness first; then SEO/metadata, mobile layout, accessibility and security headers. Checked with the
prelaunch crawler and an in-browser probe on all 8 page types at 375 / 768 / 1280 px, Lighthouse, and CPU profiles of a
throttled mid-range phone. Not deployed yet — host-level checks are listed under *After deploy*. Placeholder content
(`[Year]`, `[XX]`, …) is expected at this stage and is listed, not treated as a blocker.

## Verdict

**GO for the first Vercel deploy** — no P0 open. The one deploy blocker (canonical links, sitemap and WhatsApp previews
hard-wired to an unconfirmed domain) is fixed. Before announcing publicly, settle the four questions under
*Needs a decision* — especially the Vercel plan.

| | Found | Fixed | Open |
|---|---|---|---|
| P0 — blocker | 1 | 1 | 0 |
| P1 — before announcing | 10 | 6 | 4 |
| P2 — this week | 11 | 6 | 5 |
| P3 — backlog | 7 | 4 | 3 |

### Speed, before → after

Mobile Lighthouse (simulated slow 4G, 4× slower CPU). Both columns were measured under the same machine conditions
(Lighthouse CPU benchmark 2,150–2,640):

| Page | Score | Main thread blocked | Notes |
|---|---|---|---|
| Home | 45 → **60** | 2,960 → **640 ms** | Largest paint still ~6.5 s: the first-visit intro (see decision 1) |
| Home, desktop | 98 → 97 | 20 → 10 ms | |
| Product page | 73 → **85** | 430 → **60 ms** | |
| Story | 82 → **85** | 120 → 80 ms | |
| Manufacturing | 73 → **75** | 450 → **200 ms** | |
| Collection | 81 → 81 | 200 → **70 ms** | Page now actually in the HTML; first photo starts loading 2.1 s sooner |
| Atelier (3D) | 46 → 47 | 4,350 → 3,650 ms | Mostly one-time shader compiling; much smaller on a real phone GPU |

The last round of fixes (three.js no longer downloaded on every page, deferred Google Map, image sizes, grain layer)
came after these runs. Each only removes work and was measured on its own, but the laptop was heat-throttled by then
(benchmark dropped to ~700), so there are no comparable scores for them. With real throttling instead of simulated,
the product and collection pages paint their main content at **2.6 s** and story at **3.0 s**.

---

## Fixed

### Deploy and SEO
- `src/content/site.ts` — **(P0)** `site.url` was hard-coded to `https://istyleleathers.in` ("[confirm domain]"), so every
  canonical tag, the sitemap, robots.txt, JSON-LD and every WhatsApp/Instagram preview image pointed at a domain that may
  not be yours. It now follows Vercel's production address automatically (`VERCEL_PROJECT_PRODUCTION_URL`: the
  `*.vercel.app` URL, then your custom domain); `NEXT_PUBLIC_SITE_URL` overrides it. Verified in a Vercel-style build.
- `src/components/catalog/CollectionView.tsx`, `src/app/collection/page.tsx` — **(P1)** `/collection` was rendered only in the
  browser (`useSearchParams` opted the whole view out of static rendering): the HTML had no `<h1>` and none of the 50
  product links. The view is now in the static HTML; only a tiny `?c=` reader runs in the browser. Filters and deep links
  (`?c=bags`) verified working, with no hydration errors. *Motion note:* the grid's stagger-in now plays when a filter
  changes, not on first load (it is already on screen from the HTML).
- `src/app/collection/[slug]/page.tsx` — product pages lost `og:type`, `og:site_name` and `og:locale` (a page-level
  `openGraph` replaces the layout's); restored.

### Speed
- `src/components/home/Place.tsx` — **(P1)** the river map walked its whole SVG path once per town at load: ~3,700
  `getPointAtLength` calls, a **2.5 s freeze** on mid-range phones for a section near the bottom of the page. Now a binary
  search per town: 1,702 ms → 52 ms, same positions (within 1 unit on a 1200-unit map).
- `src/components/atelier/Configurator.tsx` — **(P1)** a plain `import * as THREE` (for one colour calculation) put three.js
  in the Atelier route bundle, and the nav prefetches that route — so **every page downloaded ~100 KB of three.js** after
  load. Replaced with an exact equivalent (0 mismatches across 4,096 colours); story, product and collection pages now
  load no 3D code at all.
- `src/components/catalog/CollectionView.tsx`, `ProductCard.tsx` — **(P1)** the collection's first-row photos were
  lazy-loaded although they are the largest thing on screen; now eager, first two high priority.
- `src/components/three/SandalScene.tsx`, `Sandal.tsx` — **(P1)** the Atelier redrew both shadow passes every frame though
  the pair never moves (only the camera does); now redrawn when the design changes. The footbed stamp texture was built
  twice (once per foot) with a slow blur on **every keystroke**; now built once per pair with a running-sum blur
  (byte-identical output, ~5× less work per keystroke).
- `src/components/contact/LazyMap.tsx`, `src/app/contact/page.tsx` — **(P1)** the Google Map embed (1.8 MB of Google
  scripts and tiles) started loading straight away although it sits far below the fold; it now loads when the visitor
  scrolls near it. Looks and works the same.
- `src/components/three/LeatherHero.tsx` — the hero shader compiles in the background (`compileAsync`) instead of
  stalling a frame, and the logo-relief texture work (~0.5 M pixels × 4 blur passes) yields between passes.
- `src/app/manufacturing/page.tsx` — the hero's product strip was lazy-loaded while on screen, and its `sizes` claimed
  22vw where phones show 42vw (soft images on phones); both fixed.
- Image `sizes` across 9 files — `(max-width: 768px)` was off by one against the 768 px layout breakpoint (tablets
  fetched images up to 3× too large); the Signature cards and collection grid now describe their real widths.
- `src/app/globals.css` — the film-grain overlay was a fixed layer 4× the screen area held on the GPU; now 1.44×, same
  look (jitter distance preserved).
- `src/app/care/page.tsx`, `story/page.tsx`, `ProductView.tsx` — `priority` (deprecated in Next 16) → `preload`.

### Security and config
- `next.config.ts` — added `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`,
  `Strict-Transport-Security` and a `Content-Security-Policy` limited to `frame-ancestors 'self'; base-uri 'self';
  object-src 'none'` (protects against framing without restricting the site's own scripts, fonts or the map embed).
  Verified on every response; `X-Powered-By` stays off.
- `src/app/page.tsx`, `src/app/collection/[slug]/page.tsx` — JSON-LD now escapes `<`, so product copy can never break out
  of its `<script>` tag.
- `package.json` — `engines.node: "24.x"`, matching the Node you build with, so Vercel builds on the same version.

### Accessibility
- `src/components/atelier/Configurator.tsx` — option groups were `h3` straight under the page's `h1`; now `h2` (no visual change).

### Ruled out (checked, not real problems)
"Unlabelled inputs" (every field is wrapped in a `<label>`), "no manifest" (served at `/manifest.webmanifest`),
"focus outline removed" (keyboard focus shows a 2 px outline on every control), "phone/email not clickable" (step
numbers and the JSON-LD), "images without dimensions" (`next/image` fill boxes; layout shift measured at 0),
"no compression" (local server only — Vercel serves brotli).

---

## Needs a decision

1. **Keep the ~2-second intro on first visits?** It plays before anything else on every new tab, and it is the main
   reason the home page's largest paint is 5–7 s on mobile tests (other pages: 2.6–3 s with real throttling). Options:
   keep it; shorten it to ~1 s; show it once per browser instead of once per tab (`localStorage` instead of
   `sessionStorage` in `Loader.tsx`); or drop it.
2. **Darken the cognac used for text and buttons from `#a45d2c` to `#9a5426`?** Cognac on cream measures **4.21:1**; WCAG
   AA needs 4.5:1 for text this size ("Stage 01–06" labels, the "3D Atelier" link, the hero's "See the collection" button
   text on phones). `#9a5426` is already in your palette and measures **4.7:1** — visually very close.
3. **Vercel plan.** Vercel's Hobby (free) plan is for non-commercial use; a business site needs Pro (about $20/month), or
   another host. Hobby is fine for previews while you and your father iterate — decide before the public launch. Hobby
   also caps monthly image optimisations; this site should fit, but watch *Usage* in the dashboard.
4. **Add analytics?** Nothing measures real visitors yet. Vercel Web Analytics + Speed Insights is cookieless, two lines
   of code and a dashboard switch — and Speed Insights shows real phones' speed, which beats any lab test. If added, a
   short privacy note on `/contact` is good practice.

---

## Open — found, not fixed

| Severity | Finding | Why not fixed |
|---|---|---|
| P1 | Placeholder copy visible (`[Year]`, `[XX]`, address, hours… in `src/content/site.ts`) | Content to fill in with your father — they show in a dashed "fill me in" style until then |
| P1 | Small tap targets on phones: bag-anatomy hotspots 32×32 px, two 16 px-tall breadcrumb links | Enlarging hit areas is easy (and can be invisible) but changes how the hotspots behave — say the word |
| P2 | Home page: hydrating ~1,300 elements and setting up every section's scroll animations still costs ~1–2 s of main thread on mid-range phones | Next step would be hydrating below-the-fold sections lazily — a bigger refactor; worth it if field data says so |
| P2 | Atelier first load compiles ~10 shader programs (1–1.5 s of main thread on mid phones, exaggerated in tests) | Inherent to the 3D configurator; it is its own page |
| P2 | Page titles over 60 characters (Google truncates them): `/manufacturing` 83, `/care` 73, `/collection` 71, `/story` 71, some products | Copy — yours to shorten |
| P2 | 124 text elements under 12 px on phones (the mono labels, 10.5–11.5 px) | Part of the design language — a decision, not a defect |
| P2 | No analytics or error monitoring | See decision 4 |
| P3 | Heading levels skip (H1 → H3) on `/story` and some product pages | Low impact; needs a look at each section's outline |
| P3 | No `/favicon.ico` (icons are served from `app/icon.png`; browsers are fine, some bots ask for `.ico`) | Cosmetic |
| P3 | No `llms.txt`, `/.well-known/security.txt`, or `og:url` | Optional |

---

## Not tested

- **The real Vercel deployment** — headers, HTTPS redirect, brotli, edge caching and image optimisation are host behaviour;
  verified locally only. See *After deploy*.
- **Real phones and Safari/iOS** — tested in Chrome with phone emulation and throttling. 3D pages were measured with
  software WebGL, which overstates shader cost; real GPUs are faster.
- **WhatsApp / email hand-off** — the links and pre-filled messages were checked, not an actual send.
- **Screen reader** — automated checks only.
- **Real-visitor speed** — none exists until there is traffic (decision 4).

---

## After deploy

1. Open `https://<project>.vercel.app/robots.txt` — it should say `Allow: /` and point `Sitemap:` at the same address.
   Then `/sitemap.xml`.
2. `curl -sI https://<project>.vercel.app | sort` — confirm the security headers arrived.
3. Run PageSpeed Insights on `/` and `/collection`.
4. Paste a product link into WhatsApp — the card should show that product's photo.
5. When you add your own domain: **redeploy** afterwards — the address is baked in at build time.
6. Then verify the domain in Google Search Console and submit `/sitemap.xml`.
7. Re-run the crawler against production: `python ~/.claude/skills/prelaunch/scripts/crawl_audit.py https://<domain>`.
