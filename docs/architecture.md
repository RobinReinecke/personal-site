# Architecture

## What this is

`robinreinecke.de` — a personal site and blog. It is a **static** Astro site (no server runtime):
the build emits plain HTML/CSS/JS to `./dist`, which is served by Caddy inside a Docker container.
See [deployment.md](deployment.md).

## Stack

- **Astro 7** — static site generator, file-based routing.
- **Tailwind CSS 4** via `@tailwindcss/vite` — styling. See [styling.md](styling.md).
- **TypeScript** — throughout.
- **MDX** — content authoring. See [content.md](content.md).
- **React** — available as an island integration; used only where interactivity is required.
- **shadcn-style UI** — ported to plain `.astro` components (no runtime React unless an island).

Package manager is **pnpm** (`packageManager` in `package.json` pins the version); Node
`>=22.12.0`.

## Folder layout

```
src/
  consts.ts            # Site-wide constants: title, URLs, nav + social links, OG defaults.
  content.config.ts    # Content collections + Zod frontmatter schema (source of truth).
  assets/fonts/        # Fonts bundled for build-time OG image generation (no network at build).
  components/
    site/              # Page-level building blocks (Header, Footer, Seo, PostCard, ...).
    ui/                # shadcn-style primitives ported to plain .astro (button, card, badge, ...).
  content/blog/        # Blog posts as .md / .mdx. Filename encodes date + slug.
  layouts/             # BaseLayout (global shell, wires Seo) and BlogPostLayout.
  lib/utils.ts         # `cn()` class-merge helper (clsx + tailwind-merge).
  pages/               # File-based routes.
    index.astro        # Home.
    about.astro
    404.astro
    blog/[...slug].astro          # Individual post pages.
    blog/index.astro              # Post listing.
    blog/tags/[tag].astro         # Per-tag listing.
    og/[...route].ts              # Build-time OG image generation (astro-og-canvas).
    rss.xml.ts                    # RSS feed.
  styles/global.css    # Tailwind entry + global styles.
scripts/social/        # Node/tsx scripts for the social cross-posting pipeline.
public/                # Static passthrough assets (e.g. robots.txt).
astro.config.mjs       # Integrations: mdx, react, sitemap (filters out /og/*).
Dockerfile             # Multi-stage: pnpm build -> Caddy runtime serving /srv.
docker-compose.yml     # Site + Umami analytics + Postgres.
Caddyfile              # Caddy config for the runtime image.
```

## Config values

Site-wide strings (title, description, canonical origin, nav links, social links, OG defaults)
live in [src/consts.ts](../src/consts.ts). Change them there, not inline.

## Astro reference

Full docs: https://docs.astro.build — consult before working on related tasks:

- [Routing, dynamic routes, middleware](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Framework components (React/Vue/Svelte)](https://docs.astro.build/en/guides/framework-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Styling & Tailwind](https://docs.astro.build/en/guides/styling/)
- [Internationalization](https://docs.astro.build/en/guides/internationalization/)
