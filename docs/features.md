# Features

Interactive and content features beyond plain pages, and the rules for keeping them working when
you add to the site. Most live in [src/components/site/](../src/components/site/).

## Command palette

- Component: [src/components/site/CommandPalette.astro](../src/components/site/CommandPalette.astro),
  mounted globally in [BaseLayout.astro](../src/layouts/BaseLayout.astro).
- Opens with **Cmd/Ctrl+K**. Arrow keys move, Enter runs, Esc or backdrop click closes.
- **Maintenance:** the command list is the `commands` array inside the component's script. **When
  you add a new page or a new user-facing action, add a matching entry** (`label`, `hint`,
  `keywords`, `run`). Pages use the `go('/path')` helper; actions dispatch events or click existing
  controls (e.g. `toggle-terminal`, `#theme-toggle`). Keep it in sync with `NAV_LINKS`
  ([src/consts.ts](../src/consts.ts)) and the footer links.

## Terminal overlay

- Component: [src/components/site/Terminal.astro](../src/components/site/Terminal.astro), mounted in
  `BaseLayout`.
- Opens with the header terminal button, the `/` key, or the `toggle-terminal` window event
  (dispatched by the header and the command palette).
- **Maintenance:** commands live in the `runCommand` switch; the `pages` map controls `cd`
  navigation. **When you add a new page, add it to the `pages` map** so `cd <page>` works, and list
  it under `help`/`ls` if it should be discoverable.

## Blog post enhancements

- [TableOfContents.astro](../src/components/site/TableOfContents.astro) — renders an "On this page"
  nav from the post's h2/h3 headings (only when there are 2+). Headings come from Astro's
  `render()` in [blog/[...slug].astro](../src/pages/blog/%5B...slug%5D.astro), passed through
  [BlogPostLayout.astro](../src/layouts/BlogPostLayout.astro).
- [RelatedPosts.astro](../src/components/site/RelatedPosts.astro) — ranks other posts by shared
  tags (then recency) and shows up to 3 after the article. Tag-driven, so good tagging in
  frontmatter improves results. See [content.md](content.md).
- [PostEnhancements.astro](../src/components/site/PostEnhancements.astro) — client script that adds
  hover copy-link anchors to headings and a "Copy" button to code blocks. It queries
  `article .prose`, so it depends on that structure in `BlogPostLayout`.

## Easter eggs

- [EasterEggs.astro](../src/components/site/EasterEggs.astro) — the `otter()` console command and
  the `otter` keystroke trigger. Add new console/keystroke gags here.
- [SelfDestruct.astro](../src/components/site/SelfDestruct.astro) — a fake, full-page "self
  destruct" animation. Triggered by the hidden `rm -rf /` terminal command via the `fake-destruct`
  window event; it dissolves the page, plays a black terminal takeover, then restores everything
  (nothing is actually deleted).
- The terminal overlay also hides undocumented commands on purpose.

## Standalone pages

- [now.astro](../src/pages/now.astro) — a `/now` page; update the `lastUpdated` date on change.
- [uses.astro](../src/pages/uses.astro) — tools, hardware, and this site's stack.
- [changelog.astro](../src/pages/changelog.astro) — the site's own changelog; newest entries at the
  top. Required to be updated for any user-visible change (see [AGENTS.md](../AGENTS.md) golden
  rules).

## Checklist when adding a page

1. Create the route in `src/pages/`.
2. Add it to `NAV_LINKS` ([src/consts.ts](../src/consts.ts)) or the footer if it should be linked.
3. Add a **command palette** entry.
4. Add it to the **terminal** `pages` map (and `help`/`ls` if discoverable).
5. Add a **changelog** entry.
