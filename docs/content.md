# Content (blog)

- For the voice and writing style of posts, see [docs/writing-style.md](writing-style.md). Read it
  before drafting.
- Posts live in [src/content/blog/](../src/content/blog/) as `*.md` or `*.mdx`. The filename
  encodes the date and slug (e.g. `2026-07-06-building-my-own-corner-of-the-internet.md`).
- The frontmatter schema is defined in [src/content.config.ts](../src/content.config.ts) — treat
  it as the source of truth and update it (and this doc) whenever fields change.

## Frontmatter fields

| Field         | Type     | Notes                                           |
| ------------- | -------- | ----------------------------------------------- |
| `title`       | string   | Required.                                       |
| `description` | string   | Required. Used for SEO meta and OG cards.       |
| `date`        | date     | Required. Coerced from a string.                |
| `updated`     | date?    | Optional last-updated date.                     |
| `tags`        | string[] | Defaults to `[]`. Drives per-tag listing pages. |
| `draft`       | boolean  | Defaults to `false`. See draft behaviour below. |
| `slug`        | string?  | Overrides the slug (defaults to the file id).   |
| `cover`       | string?  | Optional cover image path.                      |
| `series`      | string?  | Series name. See series behaviour below.        |

## Draft behaviour

Set `draft: true` while iterating locally. **Draft posts never build to production** and never
trigger the [social pipeline](social-cross-posting.md) or [OG image generation](seo.md).

## Slugs

The slug defaults to the file id; override it with the `slug` frontmatter field.

## Series

Give two or more posts the same `series` string to link them as a series. Each post in a series
renders a `SeriesNav` box ([src/components/site/SeriesNav.astro](../src/components/site/SeriesNav.astro))
below the title that lists every part in date order, numbers them, and marks the current one. Parts
are ordered by `date` (oldest first), so publishing a new post in the series slots it in and
renumbers automatically. Only non-draft posts appear, so a `draft: true` future part stays hidden
until it ships. The `series` value is shown to readers verbatim, so write it as a display name
(e.g. `Home Server`).
