// @ts-check
import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // The client's existing domain (DNS cutover from Squarespace happens in Phase 5).
  site: 'https://ssdetail.com',
  output: 'static',
  // No sessions → the adapter won't require a KV namespace on deploy.
  session: false,
  adapter: cloudflare({ imageService: 'compile' }),
  integrations: [sitemap({ filter: (page) => !/\/quote\/(thanks|error)/.test(page) })],
  trailingSlash: 'never',
  build: { format: 'file' },
  env: {
    schema: {
      // Secrets: set on the Worker (Cloudflare dashboard → Settings → Variables & Secrets) and in .dev.vars locally.
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURNSTILE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Plain vars (wrangler.jsonc "vars" or .dev.vars).
      /** Sender, e.g. "SS Detail Website <quotes@ssdetail.com>" — must be a Resend-verified domain in production. */
      RESEND_FROM: envField.string({ context: 'server', access: 'public', optional: true }),
      /** Where quote requests go (defaults to business.email). */
      QUOTE_TO: envField.string({ context: 'server', access: 'public', optional: true }),
      /** Send the customer a confirmation when they include an email. */
      SEND_CUSTOMER_CONFIRMATION: envField.boolean({ context: 'server', access: 'public', optional: true, default: false }),
      /** Turnstile widget site key (safe to expose). Widget renders only when set. */
      TURNSTILE_SITE_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
});
