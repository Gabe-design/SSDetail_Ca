# SS Detail — Site Improvement Plan

_Assessment, technology recommendation and build plan. Written 2026-09-17, before implementation._

Live site reviewed: https://fancy-bienenstitch-c11f2e.netlify.app/
Starting point: `C:\Users\Gabri\SSDetail` (was empty — see §1)
Target: GitHub `Gabe-design/SSDetail_Ca` → Cloudflare Workers (static assets + one API route) → Resend for email

---

## 0. Confirmed requirements · assumptions · missing information

### Confirmed (from the brief)
- Keep the current style, aesthetic and brand identity. Improvement, not a rebrand.
- Preserve existing content and functionality unless there is a clear reason to change it (and explain changes).
- Mobile-ready first.
- Hosting on Cloudflare. Website email through Resend.
- Repo `SSDetail_Ca` on GitHub; project lives in `SSDetail/`.
- Plan before substantial implementation.

### Assumptions (proceeding on these unless told otherwise)
1. **The deployed site is the source of truth.** `SSDetail/` contained no files, so the live `index.html` and its ten JPEGs were captured into `SSDetail/legacy/` as the starting point. Nothing else of the original project exists locally.
2. Quote requests keep going to `sscardetailingca@gmail.com` (the only contact on the site today).
3. Repo is **private** under `Gabe-design` (client site; same as `10-4-handyman`). Say so if it should be public or under another org.
4. No CMS: the client doesn't edit the site; content changes go through you. Pricing/business facts live in small data files so a price change is a one-line edit.
5. The four in-page "views" (Home / Services & Pricing / About / Quote & Contact) become four real URLs. Content is identical; only the mechanism changes.
6. A custom domain will exist and its DNS will be on Cloudflare (required for Workers custom domains and for Resend domain verification). `ssdetailca` suggests `ssdetail.ca` or `ssdetailca.com` — unconfirmed.
7. English only, one location/service area.

### Missing information that materially affects the work
| # | Missing | Why it matters | Blocks |
|---|---|---|---|
| 1 | **Domain name + who controls DNS/registrar** | Workers custom domain; Resend can only send from a verified domain (`onboarding@resend.dev` is test-only) | Phase 3 send-from address, Phase 5 cutover |
| 2 | **Service area / city, and mobile (we come to you) vs. shop drop-off** | Nowhere on the current site. Copy says "pickup" / "the shop", photos show driveways + a van. Drives hero copy, title tag, JSON-LD, footer | Copy in Phase 2 (can ship with placeholders) |
| 3 | **Phone number, and whether the owner wants texts** | No phone anywhere today. `tel:`/`sms:` CTAs are the single biggest conversion lever for a detailer | Phase 2 CTAs |
| 4 | **Cloudflare account and Resend account** — client's or yours? | Determines who owns secrets, billing, DNS. Both have free tiers that cover this site | Phase 0 deploy, Phase 3 |
| 5 | Instagram / Google Business Profile links; any existing reviews | Social proof section, footer, JSON-LD `sameAs` | Nice-to-have; ship without |
| 6 | Hours, legal business name for the footer/copyright | Footer, JSON-LD | Ship with placeholders |
| 7 | Should customers get an automatic confirmation email? | Second Resend template; needs an email field (today "Phone or Email" is one field) | Phase 3 |
| 8 | Is the Netlify site the client's to retire/redirect? | Avoid two live copies (duplicate content, split traffic) | Phase 5 |
| 9 | Are current prices/add-ons current? (Interior add-ons +$50 vs Premium +$35 — intentional?) | Content correctness | Phase 1 data files |

Nothing here blocks starting Phases 0–2.

---

## 1. What exists today

- **One `index.html` (49 KB)**: all CSS inline (~19 KB), all four "pages" as `<main class="page">` blocks toggled with `display:none` by ~3.6 KB of inline JS. Google Fonts (Oswald, Work Sans, JetBrains Mono).
- **Ten JPEGs, 5.1 MB total** (340–630 KB each, 1086–1400 px wide, all portrait phone photos). All ten load on first paint, including the five that belong to hidden views. No lazy-loading, no dimensions, no modern formats.
- **Form**: builds a `mailto:` link on submit. No server, no lead capture, fields have no `name` attributes.
- **No** favicon, meta description, Open Graph tags, structured data, sitemap, robots, or real URLs.
- Captured verbatim in `legacy/` (`index.html` + `images/`). It is reference material and is not deployed.

### Reusable as-is
- **Design tokens and component CSS** — the `:root` block, card/ticket/button/slider rules. They port into `src/styles/tokens.css` and component styles with values unchanged.
- **Logo SVG** (ring + dotted inner ring + "SS" monogram in the metal gradient) — becomes `Logo.astro`, one copy instead of two.
- **All copy** (headlines, package descriptions, inclusions, add-ons, fine print, about story, process steps, values) — moves into data files / page files unchanged except the items in §3.4.
- **Before/after slider markup + JS** — the range-input approach is sound (works with touch, mouse and keyboard); it becomes `CompareSlider.astro`.
- **"Request This Package" → pre-selected package in the form** — good UX; keep via `?package=` query param so it also works as a plain link.
- **Photos** — the Porsche, BMW interior and foam-wash shots are strong. They need resizing/format conversion, not replacing. Exception: the before/after pair (see §3.4).

### Not reusable
- The JS "router" (button-based view toggling), the `mailto:` submit handler, the `mobileMenu` inline-style toggle, Netlify meta tags/comments.

---

## 2. The aesthetic to preserve (design inventory)

These are the things that make the site look like SS Detail. They are carried over exactly; the improvements in §3 sit inside them.

| Element | Spec (from the current CSS) |
|---|---|
| **Palette** | Near-black `#0A0A0A` base, elevated surfaces `#151515` / `#202020`, "foam" text `#F5F5F5`, muted `#9C9C9C`, hairlines at 12% / 22% white. Monochrome — no accent hue. (`--teal`/`--brass` are leftover names; values are greys/white. Rename to `--accent`/`--accent-bright` with identical values.) |
| **Metal gradient** | `linear-gradient(135deg, #cfcfcf, #fff 22%, #9a9a9a 48%, #fff 74%, #c2c2c2)` — the brand's "chrome". Used on primary buttons (with the background-position sweep on hover), price and stat numerals (background-clip text), the ticket clip, the slider handle, card borders on hover, the logo ring/monogram. |
| **Surface texture** | Body: diagonal brushed hairlines (115°, 2 px on 6 px, 5% white) + fixed fractal-noise grain overlay (3.5%, overlay blend). Cards: 1 px hairline border + `inset 0 1px 0 rgba(255,255,255,.07)` top highlight. |
| **Type** | Oswald 600, uppercase, +0.02em for all headings; Work Sans 16/1.55 body; JetBrains Mono for eyebrows (`// ` prefix, +0.18em, uppercase), prices, labels, step numbers, add-on pills. |
| **Geometry** | 4 px card radius, 2 px button/input radius, 1120 px max content width, 24 px gutters. |
| **Signature components** | "WORK ORDER" hero card with floating mono label and dashed row dividers · pricing **tickets** with metal clip tab, dashed perforation line, add-on pills, right-aligned price box · oversized outlined numerals (01–04) as card watermarks · gradient hairline rules under the header and above the footer · sticky blurred header · mouse-follow gloss in the hero · before/after slider with metal circular handle. |
| **Motion** | 150–350 ms ease transitions; primary button lifts 1 px with a soft white glow; card borders turn metal on hover; `prefers-reduced-motion` respected. |
| **Voice** | Plain, specific, workshop-flavored ("Work order", "The lineup", "A few from the shop"). Keep. |

---

## 3. Recommended improvements (inside the aesthetic)

Priorities: **mobile first**, then reliability, then polish. Each item says what changes and why.

### 3.1 Layout & spacing
- **Flip the CSS to mobile-first.** Today there is one `max-width: 880px` override. New base styles are the phone layout; `min-width` breakpoints at 640 / 880 / 1120 add columns. Same look at desktop, far fewer surprises in between (tablet is currently untested territory).
- **Spacing scale** as tokens (`--space-1…8`): sections 56 px on phones → 80 px at ≥880 (today 80 px everywhere; the hero's 110 px top pad leaves ~130 px of dead space above the eyebrow on a phone → 56 px).
- **Hero**: same two-column composition at desktop; on phones the CTAs go full-width and stacked, the Work Order card sits directly under them, and a phone/text line is added under the lead (see §3.3).
- **Services & Pricing**: today four full-width tickets with 580 px hero images ≈ 5,000 px of scrolling to compare packages, and the prices are 10.5 px labels. Add a **compact lineup strip** at the top (four cells: name · from-price · one line · "Details" anchor) and keep the full tickets below, **two-up at ≥1120** (the CSS already has the 2-col grid; every ticket just has `.wide`). Ticket images 240 px on phones, 320 px on desktop. Price box becomes the most prominent element after the title.
- **Home lineup**: show all **four** packages (Premium — the highest-ticket package — is missing today while the heading says "Four ways"). 2×2 at tablet, 4-up at desktop, 1-col on phones.
- **About**: values grid 1-col on phones (2-col is cramped at 375 px); `text-wrap: balance` on the H2 to fix the "…AT A / TIME" widow.
- **Footer**: add the missing basics (service area, hours, phone, email, Instagram, © line) in the same hairline/mono style.

### 3.2 Navigation
- **Real pages and links**: `/`, `/services`, `/about`, `/quote` (+ `/quote/thanks`, `/404`). Back button, refresh, deep links and sharing work; Google indexes four pages instead of one with hidden content. Section anchors (`/services#premium`) so "View Details" lands on the package, not the top of the page.
- **Mobile menu in-theme**: a full-width dark panel under the header with hairline dividers and 48 px rows (today: four white boxes, 38 px tall, off-theme). `aria-expanded`, closes on outside tap / Esc / navigation, icon swaps ☰ → ✕, body scroll locked while open.
- **Sticky header** stays; height tightens to ~64 px on phones.
- **Floating CTA** stays on desktop. On phones it becomes a **bottom action bar** — "Text us" + "Get a quote" — respecting `env(safe-area-inset-bottom)`, hidden while the quote form is on screen. (Today the floating button is fully covered by Netlify's "Powered by" badge on every screen size; leaving Netlify removes the badge.)
- Skip-to-content link; active-page state via `aria-current`.

### 3.3 Mobile usability & conversion
- **`tel:` and `sms:` links** in the hero, quote page, footer and bottom bar (needs the number — §0).
- **Location and mobile-vs-shop statement** in the hero eyebrow / lead and footer (needs the facts — §0).
- **Touch targets ≥ 44 px** for every button/link (hero buttons are 40 px today).
- **Form**: split "Phone or Email" into Phone (required, `type=tel`, `inputmode=tel`) + Email (optional) so the customer can be texted back and can receive a confirmation; `autocomplete` attributes; inline validation messages in the mono style; a real success state and a `/quote/thanks` page for the no-JS path.
- **Social proof slot**: a reviews row near the CTAs, wired to real Google reviews when supplied; the About "stats" (4 tiers / 100% hand applied / 6+ mo) are filler and are replaced by real numbers or removed.
- **FAQ section** on the quote page (how long it takes, do I need to be there, water/power if mobile, booking lead time, payment) — answers the objections the form currently leaves open.

### 3.4 Content changes proposed (and why)
| Current | Proposed | Reason |
|---|---|---|
| Premium package absent from home lineup | Add it | Heading says four; it's the top-ticket item |
| "Int. & Ext. Premium" / "Interior & Exterior Detail — Premium" / "Interior & Exterior Detail Premium" | One name everywhere (short form "Interior & Exterior Premium") | Consistency; data file makes it structural |
| "Extraction will remove all stains." | "Extraction lifts most stains." | Absolute claim = liability |
| "Wax and coatings…" (About) | "Sealants and coatings…" | Services list ceramic sealant, not wax |
| Fine print at 11.5 px `#6B6B6B` (3.7:1) | 12.5 px `#9C9C9C` (7.2:1) | The one line that protects the client from disputes must be readable; WCAG AA |
| "Book Your Detail" (hero CTA) | "Get a Free Quote" | There is no booking; the CTA leads to a quote form |
| "Phone or Email" single field | Phone + Email | Enables text-back and confirmations |
| Before/after pair (different angles, portrait crops) | Ask client for a matched pair shot from one position, landscape | It's the only proof on the first screen; today it doesn't read as the same spot. Slider component stays. |
| Add-ons +$50 (Interior) vs +$35 (Premium) | Keep, label "$35 with Premium" if intentional | Reads as an error otherwise — needs client confirmation |

Everything else (headlines, package descriptions, inclusions, about story, process, values) is carried over verbatim.

### 3.5 Accessibility
- One `<main>` per page (four today), landmark roles, skip link, heading order (H1 per page — the sub-pages have none today).
- Contrast: retire `--muted-2` (#6B6B6B) for text under 18 px; keep it for decorative labels only.
- `aria-expanded` on the menu button, `aria-current="page"` on nav, `aria-live` status on form submit, visible focus (already present — keep the 2 px outline), 44 px targets, reduced-motion (already present — keep).
- Images: meaningful `alt` (some are "Recent detailing job"); decorative watermark numerals stay `aria-hidden` via `::before`.

### 3.6 Performance
- **Images**: build-time AVIF/WebP with `srcset` (Astro `<Image>`), sized to slots (gallery cards are 305×400 on desktop, source is 1400×2488), `loading="lazy"` below the fold, explicit dimensions (no layout shift), hero/slider images `fetchpriority="high"`. Expected: **5.1 MB → ~400–600 KB** for the home page.
- **Fonts**: self-host the three families (`@fontsource-variable/*` or subset WOFF2), `font-display: swap`, preload the display face. Removes the Google Fonts round-trip and third-party request.
- **CSS/JS**: per-page CSS (Astro scopes and inlines what each page uses); JS only for the slider, menu and form (~3 KB total), no framework runtime.
- Targets: Lighthouse mobile ≥ 95 on all four categories; LCP < 2.0 s on a mid-range phone over 4G; CLS ≈ 0.

### 3.7 Reliability & SEO
- Quote form → server endpoint → Resend (§5); Turnstile + honeypot; server-side validation; rate limit; works without JS.
- Per-page `<title>`/description, canonical, Open Graph + Twitter card with a branded 1200×630 image, `LocalBusiness` JSON-LD (`AutoWash` subtype — closest schema.org type; includes service area, phone, hours, price range), `sitemap.xml`, `robots.txt`, branded 404, favicon set (SVG + PNG + apple-touch).
- Cloudflare Web Analytics (free, cookie-less, no consent banner needed).

---

## 4. Technology stack

### Requirements the stack must meet
Four content pages · one server-side endpoint that can hold a secret (Resend API key) · image optimization for phone photos · minimal JS · easy for one developer to maintain for years · first-class Cloudflare deploy · mobile-first CSS that ports the existing design system.

### Options compared

| | **A. Astro (static) + `@astrojs/cloudflare`** | **B. Plain HTML/CSS/JS + Cloudflare Worker** | **C. Next.js (static export) + OpenNext/Cloudflare** |
|---|---|---|---|
| Build / tooling | Node 22, one `npm run build`; output is plain HTML | None | Node 22, Next build + OpenNext adapter |
| Reuse of current code | Tokens/CSS port verbatim; markup becomes components | Everything ports verbatim | CSS ports; markup rewritten as JSX |
| Repeated UI (header, footer, 4 tickets, 4 lineup cards, form select) | Components + data files → one source of truth | Copy-pasted across 4 files → drifts (this is how "Premium missing / three names" happened) | Components + data files |
| Images | `<Image>`: AVIF/WebP, srcset, dimensions at build, zero config | Manual export script (sharp/squoosh); dimensions by hand | `next/image` needs a custom loader in static export, or Cloudflare Images |
| JS shipped | 0 KB by default + ~3 KB of ours | ~3 KB of ours | React runtime (~85 KB) for three widgets |
| Form → Resend | `src/pages/api/quote.ts` with `prerender = false`, same project, same deploy | Separate Worker script beside the static assets in `wrangler.jsonc` — fine | Route handler via OpenNext — most moving parts |
| Cloudflare fit | Adapter targets Workers + static assets (official; Pages no longer supported by the adapter) | Native | Supported, heavier |
| SEO plumbing (sitemap, per-page meta, OG) | `@astrojs/sitemap`, layout props | By hand | Metadata API |
| Maintenance | Astro majors are calm; content edits are data-file edits | Zero dependencies to update; content edits are HTML edits in several places | Fast-moving majors; more to keep current |
| Learning curve for you | New but small (HTML-like components; you know Next) | None | None (Moss & Ross pattern) |
| Escape hatch | `dist/` is static HTML — can be served anywhere if the build step is ever dropped | n/a | Locked to the framework |

### Recommendation: **A — Astro, static output, Cloudflare adapter**
- It solves the site's actual problems structurally: the consistency bugs (data files + components), the 5 MB image payload (`<Image>`), missing SEO plumbing (per-page layout + sitemap), and the form (one endpoint in the same project).
- It preserves the polish: zero framework JS, so the site stays as light as the hand-written original.
- Option B is the honest runner-up: it's your 10-4 Handyman pattern and has zero tooling. I'd pick it only if a no-build constraint appears; the cost is manual image work and four-way duplication of header/footer/pricing. Option C is more than this site needs.

Versions at time of writing: Astro 6 with `@astrojs/cloudflare` v13 (env via `astro:env/server` or `cloudflare:workers`), Node 22 LTS. Your nvm default is Node 18 (EOL) — the project pins Node 22 via `.nvmrc` (you already have v22.22.3 installed).

---

## 5. Cloudflare and Resend

### Hosting: Cloudflare **Workers with static assets** (not Pages)
- Cloudflare directs new projects to Workers; the Astro adapter dropped Pages support in v13. Moss & Ross is on Pages and that's fine to leave, but this project starts on Workers.
- The Astro build produces `dist/` (static HTML/CSS/images) plus a tiny Worker that serves the assets and runs `/api/quote`. Config is one `wrangler.jsonc` (generated by the adapter's setup).
- **Deploy: Workers Builds connected to `SSDetail_Ca`** — push to `main` deploys production; other branches / PRs get preview URLs (`*.workers.dev`). No CI to write. Manual fallback: `npx wrangler deploy`.
- **Secrets**: `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY` set in the Worker's settings (or `wrangler secret put`); locally in `.dev.vars` (git-ignored). Public `TURNSTILE_SITE_KEY` in `wrangler.jsonc` vars.
- **Domain**: add the client's domain to Cloudflare (nameserver change if it isn't there), then Workers → Custom Domains. Until then the site lives at `ssdetail-ca.<account>.workers.dev`.
- **Extras** (all free tier): Cloudflare Web Analytics; Turnstile widget; a WAF rate-limiting rule on `/api/quote` (e.g., 5 requests / minute / IP).
- Cost: $0 on the Workers free plan (100k requests/day; static asset requests are free).

### Email: Resend
- **What the site needs to send**: (1) a quote-request notification to the business — subject "Quote request — {name} · {package}", body with all fields, `reply_to` = customer's email so replying from Gmail just works; (2) optional customer confirmation ("We got your request, we reply within 24 hours") — only if an email was given and the client wants it (§0 #7).
- **Sender**: `quotes@{domain}` on a **verified domain** (Resend gives DKIM/SPF/DMARC records; they go straight into Cloudflare DNS). `onboarding@resend.dev` is test-only and delivers only to the Resend account owner — useful for Phases 0–3, not for launch. Recipient stays the Gmail address.
- **How**: the `/api/quote` endpoint calls Resend's REST API with `fetch` (no SDK needed in a Worker; the `resend` package also works if you prefer typed calls). Idempotency key per submission to prevent duplicate sends on double-clicks. Rate limit is 10 req/s per team — irrelevant at this volume. Free tier 3,000 emails/month.
- **Endpoint flow**: `POST /api/quote` → honeypot check → parse & validate (name, phone, email?, vehicle, package, notes; lengths; phone shape) → verify Turnstile token with Cloudflare → send business email → (optional) send confirmation → JSON `{ok:true}` for the JS path, or `303 → /quote/thanks` when submitted without JS. Errors return a friendly message; nothing about the API key ever reaches the browser.

---

## 6. Project structure

```
SSDetail/
├── legacy/                     # verbatim snapshot of the live site (reference; not deployed)
├── docs/
│   ├── PLAN.md                 # this document
│   └── CONTENT.md              # copy inventory + client questions (Phase 1)
├── public/                     # copied as-is: favicon.svg, favicon.ico, apple-touch-icon.png, robots.txt, og.jpg
├── src/
│   ├── assets/images/          # originals; optimized at build by <Image>
│   ├── data/
│   │   ├── business.ts         # name, phone, email, service area, hours, socials, domain → used by header, footer, JSON-LD, form
│   │   └── packages.ts         # the four packages: name, slug, tiers/prices, includes, add-ons, fine print, image
│   ├── styles/
│   │   ├── tokens.css          # :root tokens (values unchanged) + spacing scale
│   │   ├── base.css            # reset, body texture/grain, typography, focus, utilities
│   │   └── components.css      # shared component rules (or scoped per component)
│   ├── components/
│   │   ├── Logo.astro  Header.astro  MobileMenu.astro  Footer.astro  Seo.astro
│   │   ├── Button.astro  Eyebrow.astro  SectionHead.astro  CtaBanner.astro
│   │   ├── WorkOrderCard.astro  PackageOverview.astro  PackageTicket.astro  LineupStrip.astro
│   │   ├── CompareSlider.astro  Gallery.astro  ProcessSteps.astro  ValuesGrid.astro
│   │   └── QuoteForm.astro  FloatingCta.astro  Faq.astro  Reviews.astro
│   ├── layouts/Base.astro      # <head>, fonts, header, footer, floating CTA, JSON-LD
│   └── pages/
│       ├── index.astro  services.astro  about.astro  quote.astro  404.astro
│       ├── quote/thanks.astro
│       └── api/quote.ts        # prerender = false → Worker route → Resend
├── astro.config.mjs            # cloudflare adapter, site URL, sitemap
├── wrangler.jsonc              # name, assets, vars (TURNSTILE_SITE_KEY), compatibility date
├── .dev.vars.example           # RESEND_API_KEY=, TURNSTILE_SECRET_KEY=
├── .nvmrc (22)  package.json  tsconfig.json  .gitignore  README.md
```

Data-file shape (illustrative):
```ts
// src/data/packages.ts
export const packages = [
  { slug: "maintenance", name: "Maintenance Detail", from: 70,
    tiers: [{ label: "Sedan / Mid-size SUV", price: 70 }, { label: "Trucks & 3-Row", price: 80 }],
    tagline: "A minor detail service to keep your vehicle in pristine condition. Recommended monthly.",
    short: "A monthly minor detail to keep your vehicle in pristine, ready-to-drive condition.",
    includes: ["Full interior vacuum & wipe down", /* … verbatim from legacy */],
    addons: [], finePrint: "Excessive dirt, pet hair, etc. may result in an additional charge.",
    image: maintenanceService },
  // interior, decon-clay-seal, premium …
];
```
The hero Work Order card, home lineup, lineup strip, tickets, form `<select>` and JSON-LD `offers` all render from this one array.

---

## 7. Implementation sequence

Each phase ends deployed to a preview URL so progress is visible.

**Phase 0 — Scaffold & baseline (½ day)**
1. `git init` in `SSDetail/`; commit `legacy/` and `docs/` as the first commit ("baseline: snapshot of live site").
2. Create private repo `Gabe-design/SSDetail_Ca`, push. (`gh` is authenticated as Gabe-design with `repo` scope — no missing access.)
3. `nvm use 22`; `npm create astro@latest` (empty template, TypeScript), add `@astrojs/cloudflare`, `@astrojs/sitemap`, `sharp`, fontsource packages. `.nvmrc`, `.gitignore`, `README.md`.
4. Port `tokens.css` / `base.css` verbatim; self-host fonts; `Base.astro` layout with header/footer shells.
5. Connect the repo to Workers Builds → first preview deploy of an empty shell. **Done when**: preview URL renders the header/footer in the correct style.

**Phase 1 — Parity port (1–1½ days)**
1. `packages.ts` and `business.ts` from the legacy copy (placeholders for unknown facts, marked `TODO(client)`).
2. Components + four pages, content verbatim, images through `<Image>`, real links, anchors.
3. Parity review against `legacy/index.html` at 375 / 768 / 1280: same sections, same order, same copy (except §3.4), same look. **Done when**: side-by-side screenshots match and Lighthouse mobile performance ≥ 90 already (images alone get it there).

**Phase 2 — Mobile-first polish (1–1½ days)**
1. Mobile-first CSS restructure with the spacing scale and breakpoints (§3.1).
2. In-theme mobile menu, tightened header, hero spacing, full-width CTAs, bottom action bar (§3.2).
3. Lineup strip + two-up tickets + prominent price boxes; four-package home lineup; footer content; contrast/targets/aria fixes (§3.3–3.5).
4. Content changes from §3.4 applied; `CONTENT.md` lists the client questions. **Done when**: axe reports no violations; every target ≥ 44 px; real-phone check (iOS Safari + Android Chrome).

**Phase 3 — Quote form → Resend (½–1 day)**
1. `api/quote.ts` endpoint, validation, honeypot, Turnstile, Resend send (test sender until the domain is verified), idempotency, `/quote/thanks`.
2. Progressive enhancement: works with JS disabled; with JS shows inline success/error.
3. Test matrix: valid submit, missing fields, bot (honeypot), bad Turnstile, Resend failure (shows a friendly error with the email address as fallback). **Done when**: a test submission arrives in the inbox with a working reply-to, and the Resend dashboard shows delivered.

**Phase 4 — SEO, meta, analytics, 404 (½ day)**
Per-page meta, OG image, JSON-LD, sitemap, robots, favicons, 404, Cloudflare Web Analytics. **Done when**: Rich Results test passes; social preview shows correctly; sitemap lists four pages.

**Phase 5 — QA & launch (½ day + waiting on DNS)**
Lighthouse ≥ 95 ×4 on mobile; cross-browser pass; content sign-off from the client (fill the `TODO(client)` items); verify the Resend domain; add the custom domain to the Worker; cut DNS over; set the Netlify site to redirect to the new domain (or delete it); submit the sitemap in Search Console.

Total: roughly 4–6 working days of build, plus client turnaround for the facts in §0.

---

## 8. Decisions needed from you before Phase 0
1. Approve the stack (Astro on Workers) — or say "plain HTML" and the plan adapts (same structure minus components/data files).
2. Repo visibility (default: private) and owner (default: `Gabe-design`).
3. Which Cloudflare and Resend accounts to use (yours or the client's).
4. The §0 client questions — I'll draft them as a short message you can forward.
