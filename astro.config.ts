import { defineConfig } from 'astro/config';
import UnoCSS from '@unocss/astro';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cozytrip.kr',
  output: 'static',
  integrations: [
    UnoCSS(),
    sitemap({
      filter: (url) => {
        const excluded = ['/studio/', '/search/', '/admin/hotels/'];
        const pathname = new URL(url).pathname;
        return !excluded.some((path) => pathname.startsWith(path));
      },
    }),
  ],
  build: { format: 'directory' },
  server: {
    open: true,
  },
});
