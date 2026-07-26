# robinreinecke.de

Personal site + blog. Static Astro site, Tailwind, shadcn-style components ported as plain
`.astro` files, self-hosted as a Docker container.

## Quick start

```sh
pnpm install
pnpm dev          # http://localhost:4321
pnpm check        # typecheck (astro check)
pnpm build        # static output to ./dist
```

Formatting is handled by Prettier (Astro + Tailwind class-sorting plugins); linting by ESLint
(flat config, TypeScript + Astro). CI runs `format:check`, `lint`, `check`, and `build` on every
push and pull request.

## Documentation

- [AGENTS.md](AGENTS.md) — start here: the rules, commands, and a map of the knowledge base.
- [docs/](docs/README.md) — the knowledge base: architecture, content, SEO, styling, deployment,
  social cross-posting, testing, and decisions.
