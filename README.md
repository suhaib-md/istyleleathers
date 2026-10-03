# I Style Leathers — website

Brand + manufacturing website for **I Style Leathers**, a family leather workshop in Melvisharam, Tamil Nadu.
Two audiences: retail buyers (order on WhatsApp) and brands / businesses (private label, bulk, corporate gifts).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all 50 product pages are pre-rendered)
npm start          # serve the production build
```

Stack: Next.js 16 (App Router) · React 19 · Tailwind v4 · GSAP (ScrollTrigger, SplitText) · Lenis smooth scroll ·
three.js / @react-three/fiber / drei.

## What's on it

| Page | What it does |
|---|---|
| `/` | Leather hero rendered in a GLSL shader (logo heat-stamped in gold foil, cursor-lit), scroll-scrubbed manifesto, signature pieces (pinned horizontal scroll), anatomy of a bag (hotspots), curved 3D gallery, six-stage process, 3D leather swatch book, 3D atelier teaser, B2B numbers, how ordering works, Palar-river map, Instagram strip, real workshop photos |
| `/collection` | All 50 pieces — category tabs, type filters, grid view (tilt + hover image swap) and index view (floating preview) |
| `/collection/[slug]` | Product page — gallery with zoom lightbox, story, spec sheet, WhatsApp enquiry pre-filled with the product, related pieces, JSON-LD, per-product link-preview image |
| `/manufacturing` | Private label / bulk — capabilities, project stages, customisation, swatch book, FAQ, enquiry form (opens WhatsApp or email) |
| `/atelier` | Live 3D sandal configurator — silhouette, leather finish, colours, sole, thread, hardware, text/logo stamped on the footbed (blind / gold / silver). Sends the spec to WhatsApp, saves a PNG |
| `/story` | Founder story, timeline, values, the six stages, workshop photos |
| `/contact` | WhatsApp / email / Instagram, visit details, map, quick message |

## Editing content

* **Business facts & placeholders** → `src/content/site.ts`.
  Anything written as `[like this]` shows on the site with a dashed "fill me in" style. Replace the text and it updates everywhere.
* **Products** → `src/content/products.ts` (name, description, materials, features, images). No prices are shown — every
  product is "price on request" via WhatsApp.
* **Story page text / timeline** → `src/app/story/page.tsx`.
* **Leather swatches** → `src/content/materials.ts`. **Atelier options** → `src/content/atelier.ts`.

### Still to fill in (search the code for `[`)

- Founder's name, year established, years of experience, team size, monthly capacity, minimum order quantity
- Sample / production lead times, export countries, workshop address, hours, floor area
- Exchange / return terms, confirmed footwear sizes
- A photo of the founder at work (placeholder box on `/story`)
- The real domain → `site.url` in `src/content/site.ts` (used for link previews, sitemap and canonical URLs)

## Images

Source photos live one folder up (`../Bags`, `../Professional Images`, `../Instagram`, …). They are curated and converted
to WebP by:

```bash
python scripts/process_images.py     # → public/img/** + src/content/images.json
python scripts/make_logo.py          # → public/brand/logo-*.png + favicons
python scripts/make_og.py            # → src/app/opengraph-image.png
python scripts/make_product_og.py    # → public/og/<slug>.jpg (WhatsApp/Instagram link previews)
```

**Deliberately excluded:** many factory photos show other companies' names or patterns on insoles and bags
(Hermès, Calvin Klein, Tommy Hilfiger, Boss, Clarks, Skechers, Woodland, Gucci-style stripes, MK/Coach monograms).
None of those are used — showing third-party trademarks on our own site is a legal risk. Gemini "sparkle" watermarks
were cropped out of the AI-edited studio shots.

## Motion & accessibility

* Visitors whose device asks for reduced motion get a calmer version (fades, no parallax / pinning / smooth-scroll).
  Anyone can switch with **Motion: Full / Reduced** in the footer (remembered per browser).
  Note: Windows with *Settings → Accessibility → Visual effects → Animation effects* turned **off** counts as
  "reduced motion".
* 3D canvases pause when off-screen; three.js only downloads when a 3D section is about to scroll into view.

## Deploy

Push the folder to a Git repo and import it into Vercel (zero config), or run `npm run build && npm start` on any Node 20+
host. Update `site.url` first.
