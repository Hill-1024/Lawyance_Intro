import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  integrations: [vue()],
  output: 'static',
  adapter: cloudflare()
});