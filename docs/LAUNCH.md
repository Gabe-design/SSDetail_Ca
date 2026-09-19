# Launch runbook: Cloudflare + Resend

Everything below runs from `C:\Users\Gabri\SSDetail` with Node 22 (`nvm use`). Steps marked **you** need
your browser or account credentials; the rest can be run by Claude or you from the terminal.

## 0. Decide the accounts

| Service | Account | Why it matters |
|---|---|---|
| Cloudflare | yours or the client's | Owns the Worker, DNS for ssdetail.com, Turnstile, analytics |
| Resend | same rule | Owns the sending domain and the API key; free tier = 3,000 emails/month |
| ssdetail.com registrar | currently Squarespace Domains | Nameservers must be pointed at Cloudflare |

Using your own accounts is fine to get live; both let you transfer or invite the client later.

## 1. Cloudflare login and first deploy (5 min)

```bash
npx wrangler login
```
**You:** approve in the browser window (pick the account from step 0). Then:

```bash
npm run build
npx wrangler deploy
```
The site is live at `https://ssdetail-ca.<account>.workers.dev`. The quote form will show the friendly
error until step 3 (no API key yet).

## 2. Resend account, domain and key (15 min, mostly waiting on DNS)

1. **You:** create the account at resend.com (or sign in).
2. **You:** Domains → Add domain → `ssdetail.com`, region US. Resend shows 3–4 DNS records (DKIM TXT/CNAME,
   SPF TXT, optional DMARC). Leave the tab open.
3. Those records go into Cloudflare DNS once the zone exists (step 4). Until then the sender stays
   `onboarding@resend.dev`, which only delivers to the Resend account owner's inbox. Good enough to test.
4. **You:** API Keys → Create → name `ssdetail-website`, permission *Sending access*, domain: all (or
   ssdetail.com once verified). Copy it once.
5. Paste it into `.dev.vars` (git-ignored) as `RESEND_API_KEY=re_...` and tell Claude, or run step 3 yourself.

## 3. Two environments: testing (you) and production (the client)

`wrangler.jsonc` defines two Workers from the same code:

| | Worker | Command | Quote emails go to | Sender |
|---|---|---|---|---|
| **Testing** (default) | `ssdetail-ca` at `ssdetail-ca.gabrielaross8.workers.dev` | `npm run deploy` | gabrielaross8@gmail.com | onboarding@resend.dev (test) |
| **Production** | `ssdetail-ca-production` on ssdetail.com | `npm run deploy:production` | sscardetailingca@gmail.com | quotes@ssdetail.com (needs step 4) |

The environment is chosen at **build** time (`CLOUDFLARE_ENV=production`, which `build:production` sets), because
the Astro adapter resolves the Wrangler config while building. Each Worker has its own secrets:

```bash
npm run secrets              # uploads .dev.vars to ssdetail-ca (testing)
npm run secrets:production   # uploads .dev.vars to ssdetail-ca-production
```

With Workers Builds, make it two dashboard projects on the same repo: the existing one for testing
(branch `main`, build `npm run build`, deploy `npx wrangler deploy`) and a second one named
`ssdetail-ca-production` (branch `production`, build `npm run build:production`, deploy
`npx wrangler deploy --env production`). Day to day: push to `main` to test, merge `main` into
`production` to go live. Secrets for the production project are set once in its dashboard settings.

Local test: `npm run dev`, submit at http://localhost:4321/quote (reads `.dev.vars`).

## 4. Move ssdetail.com to Cloudflare DNS (you, ~10 min + propagation)

1. Cloudflare dashboard → Add a domain → `ssdetail.com` → Free plan. Cloudflare imports the existing
   records; keep them so the Squarespace site stays up during the switch.
2. Squarespace → Domains → ssdetail.com → DNS / nameservers → replace with the two Cloudflare
   nameservers shown. Propagation: minutes to a few hours.
3. Add the Resend records from step 2 in Cloudflare DNS (Proxy status: DNS only). Back in Resend, click
   Verify. Then change `RESEND_FROM` in `wrangler.jsonc` to `SS Detail Website <quotes@ssdetail.com>` and
   redeploy. Confirmations to customers (`SEND_CUSTOMER_CONFIRMATION`) can be switched on from this point.

## 5. Custom domain on the production Worker

Uncomment the `routes` block inside `env.production` in `wrangler.jsonc`, then `npm run deploy:production`
(or push to the `production` branch). Cloudflare creates the DNS records and certificate for `ssdetail.com` and
`www.ssdetail.com`. Delete any leftover Squarespace A/CNAME records for the apex and www if the deploy reports
a conflict. The testing Worker keeps its workers.dev URL.

Confirm `https://ssdetail.com` shows the new site, then in Squarespace unpublish the old site and, on
Netlify, delete the `fancy-bienenstitch` site (or set a redirect to ssdetail.com).

## 6. Auto-deploys from GitHub (optional but recommended)

Cloudflare dashboard → Workers & Pages → `ssdetail-ca` → Settings → Build → Connect repository →
`Gabe-design/SSDetail_Ca`, branch `main`, build command `npm run build`, deploy command `npx wrangler deploy`.
Every push to `main` deploys; other branches get preview URLs. Add the same secrets as build variables only
if a build-time value needs them (none today; `TURNSTILE_SITE_KEY` and `CF_BEACON_TOKEN` are the two
build-time vars, and they are optional).

## 7. Turnstile (spam shield, optional, 5 min)

Dashboard → Turnstile → Add widget → domain `ssdetail.com` (+ the workers.dev host for testing), mode
Managed. Put the **site key** in `.dev.vars` as `TURNSTILE_SITE_KEY=` (build-time, so also add it as a
build variable in step 6 or in your shell before `npm run build`) and the **secret** as
`TURNSTILE_SECRET_KEY=`, then `npx wrangler secret bulk .dev.vars` and redeploy. The widget renders only
when the site key is present; the endpoint verifies only when the secret is present.

## 8. Analytics (2 min)

Dashboard → Analytics & Logs → Web Analytics → Add site → ssdetail.com → copy the token into `.dev.vars`
as `CF_BEACON_TOKEN=` (build-time) and rebuild/deploy. Cookie-less, no consent banner needed.

## 9. After launch

- Google Search Console: add ssdetail.com, submit `https://ssdetail.com/sitemap-index.xml`.
- Update the Instagram link-in-bio (Linktree) and Google Business Profile website field to ssdetail.com.
- Add a WAF rate-limiting rule for `/api/quote` (Security → WAF → Rate limiting: 5 requests per minute per IP).
- Watch Resend → Logs for the first few real submissions.
