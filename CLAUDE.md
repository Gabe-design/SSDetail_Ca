# SS Detail site — notes for Claude Code

- Plan, assumptions and open client questions: docs/PLAN.md. Keep it current when scope changes.
- Node 22 (`.nvmrc`). The nvm default on this machine is 18 — use `nvm use` or the absolute node path.
- Dev server: `npm run dev` (the desktop app's launch config "ssdetail-dev" runs it with Node 22).
  If scoped component styles look stale in the browser after editing a `.astro` file, restart the dev server.
- Content rules: copy comes from `legacy/index.html` verbatim unless docs/PLAN.md §3.4 lists the change.
  Business facts and prices live only in `src/data/*.ts`; never hard-code them in components.
- `null` facts in `src/data/business.ts` are unconfirmed client details — render nothing, never placeholder text.
- Brand assets are generated: edit `scripts/build-brand.mjs`, then `npm run brand`.
- Scroll reveal: add class `reveal` (plus `style="transition-delay:80ms"` to stagger) or use `<Reveal>`;
  the layout's inline script adds `.js-reveal` before paint and `src/scripts/reveal.ts` reveals on scroll.
  Never put `reveal` on the hero or anything else that should paint immediately (LCP).
- Scroll offer dialog (`ScrollOffer.astro`): opens once at 60% scroll, remembered 30 days in localStorage
  (`ssd-offer-seen`), always shows in dev, off on the quote pages via `<Base offer={false}>`.
- Both were ported from the Moss & Ross site (mr-digital: Reveal.tsx, DemoOffer.tsx) with the same timings.
- Work videos: `src/data/videos.ts` + `VideoReel.astro`; encoded MP4s in `public/videos` (720×1280, H.264, ≤10 MB each,
  Workers' static-asset limit is 25 MiB per file). Raw client files stay in `legacy/client-videos` (git-ignored).
  ffmpeg (winget Gyan.FFmpeg) is on this machine; the recipe is in videos.ts.
- Cloudflare: Workers with static assets via `@astrojs/cloudflare`; `session: false` in astro.config so no KV is needed.

Astro docs: https://docs.astro.build (routing, components, styling, images).

## Deploying (until the Worker is reconnected to SSDetail_Ca)
The Cloudflare wizard created a second repo, `Gabe-design/ssdetail-ca`, and the Worker builds from **that**
(Workers & Pages → ssdetail-ca → Settings → Build). Its history was merged into `main` once (tree unchanged), so a
deploy is: `git push origin main && git push cloudflare main` (remote `cloudflare` = ssdetail-ca). Builds take ~45 s;
no GitHub status is posted, so confirm by checking the live CSS/HTML. Preferred fix: reconnect the Worker to
`SSDetail_Ca` in the dashboard and delete `ssdetail-ca`, then drop the `cloudflare` remote.
