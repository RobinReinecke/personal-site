# SEO & social previews

## Meta and structured data

Every page emits its meta set from [src/components/site/Seo.astro](../src/components/site/Seo.astro),
wired through `BaseLayout`: description, canonical URL, robots, Open Graph, and Twitter
`summary_large_image`. JSON-LD is injected per page (`WebSite` + `Person` on home, `BlogPosting`
on posts).

## OG images

OG images (1200x630) are generated at build time by `astro-og-canvas` in
[src/pages/og/[...route].ts](../src/pages/og/%5B...route%5D.ts):

- one card per non-draft post (`/og/blog/<slug>.png`),
- plus a site-wide `/og/default.png` (used as the fallback via `DEFAULT_OG_IMAGE` in
  [src/consts.ts](../src/consts.ts)).

Fonts ([src/assets/fonts/](../src/assets/fonts/)) and the logo are bundled in the repo so the
build never needs network access. Edit `getImageOptions` in that route to change card styling.

## Sitemap & robots

`@astrojs/sitemap` generates `sitemap-index.xml`. OG image routes are filtered out of the sitemap
in [astro.config.mjs](../astro.config.mjs) because they are assets, not pages.
[public/robots.txt](../public/robots.txt) points to the sitemap.
