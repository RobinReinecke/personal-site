# AGENTS.md

Starting point for coding agents and developers. This file is intentionally short: it holds the
rules and the fastest commands, then points you to the knowledge base. **Do not accumulate
detailed knowledge here** — put it in [docs/](docs/README.md).

## Golden rules

1. **Keep documentation current.** Every change that affects how the code works, is built, or is
   operated MUST update the relevant file (this file and/or [docs/](docs/README.md)) in the same
   change. Add new knowledge; delete or correct anything obsolete. Out-of-date docs are a bug.
2. **Test important code before marking a feature done.** Any non-trivial logic must be covered by
   a test or a documented manual verification. See [docs/testing.md](docs/testing.md).
3. **The build must stay green.** `pnpm check` and `pnpm build` must pass locally before you
   finish. CI runs `format:check`, `lint`, `check`, and `build`.
4. **Keep the changelog current.** Any user-visible change to the site (new pages, features, notable
   fixes) MUST add an entry to [src/pages/changelog.astro](src/pages/changelog.astro) in the same
   change. Add newest entries at the top with an accurate date and the right `added`/`changed`/`fixed`/`removed` type.

## Commands

```sh
pnpm install        # install dependencies (use --frozen-lockfile in CI/Docker)
pnpm dev            # dev server at http://localhost:4321
pnpm check          # typecheck via `astro check` — run before finishing
pnpm build          # static build to ./dist — run before finishing
pnpm preview        # preview the built ./dist locally

pnpm lint           # ESLint (flat config, TS + Astro)
pnpm lint:fix       # ESLint with autofix
pnpm format         # Prettier write (Astro + Tailwind class-sorting plugins)
pnpm format:check   # Prettier check (used in CI)
```

Dev server in background mode (preferred for agents): `astro dev --background` — manage with
`astro dev stop`, `astro dev status`, and `astro dev logs`.

## Where the knowledge lives

Read the relevant file in [docs/](docs/README.md) before working on a task:

- [docs/architecture.md](docs/architecture.md) — what this is, the stack, folder layout, config.
- [docs/content.md](docs/content.md) — authoring blog posts and the frontmatter schema.
- [docs/writing-style.md](docs/writing-style.md) — the voice and writing style for blog posts.
- [docs/features.md](docs/features.md) — interactive features (command palette, terminal, blog enhancements) and how to keep them in sync when adding pages.
- [docs/seo.md](docs/seo.md) — SEO meta, structured data, OG images, sitemap.
- [docs/styling.md](docs/styling.md) — Tailwind, `cn()`, component conventions.
- [docs/deployment.md](docs/deployment.md) — Docker, Caddy, Umami, CI.
- [docs/social-cross-posting.md](docs/social-cross-posting.md) — the dev.to / LinkedIn / X pipeline.
- [docs/testing.md](docs/testing.md) — testing policy and how to add a runner.
- [docs/decisions.md](docs/decisions.md) — important decisions and their rationale.
