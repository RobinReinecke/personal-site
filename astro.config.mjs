// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://robinreinecke.de',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    mdx(),
    react(),
    // Generated OG images live under /og/*.png; they are assets, not pages.
    sitemap({ filter: (page) => !page.includes('/og/') }),
  ],
});
