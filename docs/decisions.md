# Decisions

A running log of important architectural decisions and their rationale. Append new entries at the
top. Keep each entry short: what was decided, why, and any consequence worth remembering.

---

## Static site served by Caddy in Docker

**Decision:** Ship a fully static Astro build (`./dist`) served by Caddy in a container; no server
runtime.

**Why:** The site is content-driven (blog + a few pages). Static output is cheap to host, fast,
and trivially cacheable, with a minimal attack surface.

**Consequence:** Anything dynamic must be handled at build time (see OG images) or as a
client-side island. No request-time server logic.

---

## Build-time OG image generation with bundled assets

**Decision:** Generate OG preview images at build time with `astro-og-canvas`, using fonts and the
logo bundled in the repo.

**Why:** Keeps social previews consistent and branded without a runtime image service, and lets
the build run with no network access (reproducible, works in locked-down CI/Docker).

**Consequence:** Font/logo assets live in the repo; card styling is code in
[src/pages/og/[...route].ts](../src/pages/og/%5B...route%5D.ts). See [seo.md](seo.md).

---

## shadcn UI ported to plain `.astro`

**Decision:** Port shadcn-style primitives to plain `.astro` components instead of shipping React
for them.

**Why:** Avoids shipping runtime JavaScript for static UI; React stays available as an island only
where interactivity is genuinely needed.

**Consequence:** UI primitives in `src/components/ui/` have no client runtime. See
[styling.md](styling.md).

---

## Human-in-the-loop social cross-posting

**Decision:** Automation only generates drafts and opens a review issue; publishing is a manual
step.

**Why:** Keeps editorial control — nothing goes public without a human confirming copy and timing.

**Consequence:** Two workflows (`social-draft`, `social-publish`); dev.to drafts stay unpublished
until dispatched. See [social-cross-posting.md](social-cross-posting.md).
