# SS Detail — website

Improved rebuild of the SS Detail (Showroom Shine Auto Detailing) site. Same brand and content as the original,
rebuilt for phones first, real pages, a working quote form and fast images.

- **Stack:** Astro (static output) · TypeScript data files · plain CSS design system · Cloudflare Workers (static assets + one API route) · Resend for email
- **Plan & assessment:** [docs/PLAN.md](docs/PLAN.md)
- **Original site (reference only, not deployed):** [legacy/](legacy/)

## Develop

Requires Node 22 (`.nvmrc`). With nvm: `nvm use`.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/ (Cloudflare Worker + static assets)
npm run preview    # serve the production build locally via wrangler
npm run check      # type-check .astro/.ts
npm run brand      # regenerate logo/favicon/OG assets from scripts/build-brand.mjs
```

## Where things live

| Path | What |
|---|---|
| `src/data/business.ts` | Name, owners, phone, email, service area, hours, socials — **edit facts here** |
| `src/data/packages.ts` | The four packages: prices, tiers, inclusions, add-ons — **edit pricing here** |
| `src/data/nav.ts` | Primary navigation |
| `src/styles/tokens.css` | Design tokens (colors, metal gradient, type, spacing) — values from the original site |
| `src/styles/base.css` | Reset, textures, typography, buttons, cards, forms (mobile-first) |
| `src/components/` | Header, Footer, Logo, Hero, WorkOrderCard, … |
| `src/layouts/Base.astro` | `<head>` (meta, OG, favicons), header, footer |
| `src/pages/` | `/`, `/services`, `/about`, `/quote`, `/404` (+ `api/quote.ts` in Phase 3) |
| `src/assets/images/` | Photo originals; optimized at build by `<Image>` |
| `src/assets/brand/` | Logo mark / full logo SVGs (generated) |
| `public/` | Favicons, OG image, robots (copied as-is) |
| `scripts/build-brand.mjs` | Builds the brand assets from vector primitives |

## Deploy (Cloudflare Workers)

Connect this repo in the Cloudflare dashboard → Workers & Pages → Create → Import a repository → build command
`npm run build`, deploy command `npx wrangler deploy`. Secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`) are set on the
Worker; locally they go in `.dev.vars` (see `.dev.vars.example`). Details in docs/PLAN.md §5.
