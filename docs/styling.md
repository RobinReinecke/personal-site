# Styling & components

## Tailwind

- Tailwind CSS 4 via the Vite plugin (`@tailwindcss/vite`); the global entry is
  [src/styles/global.css](../src/styles/global.css).
- Class ordering is enforced by the Prettier Tailwind plugin — run `pnpm format`.

## The `cn()` helper

Use `cn()` from [src/lib/utils.ts](../src/lib/utils.ts) to compose conditional classes. It merges
`clsx` output through `tailwind-merge` so conflicting utilities resolve predictably.

## Components

- `src/components/ui/` — shadcn-style primitives ported to plain `.astro` (button, card, badge,
  separator). No runtime React unless a component is explicitly an island.
- `src/components/site/` — page-level building blocks (Header, Footer, Seo, PostCard, and the
  interactive bits like EasterEggs, NetworkBackground, Terminal, ThemeToggle, TypingText).
- React is available as an Astro island integration; add interactivity only where it is needed.
