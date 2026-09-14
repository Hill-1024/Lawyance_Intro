import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
  site: 'https://lawver.mutsumi.moe',
  integrations: [vue()],
  output: 'static',
});
