// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Updated to the custom domain at launch (docs/PLAN.md §5).
  site: 'https://ssdetail-ca.workers.dev',
  output: 'static',
  // No sessions → the adapter won't require a KV namespace on deploy.
  session: false,
  adapter: cloudflare({ imageService: 'compile' }),
  integrations: [sitemap()],
  trailingSlash: 'never',
  build: { format: 'file' },
});
