import { defineConfig } from 'astro/config';
import UnoCSS from '@unocss/astro';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cozytrip.kr',
  output: 'static',
  integrations: [UnoCSS(), sitemap()],
  build: { format: 'directory' },
  server: {
    open: true,
  },
});
