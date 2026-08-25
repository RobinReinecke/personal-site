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

## Draft behaviour

Set `draft: true` while iterating locally. **Draft posts never build to production** and never
trigger the [social pipeline](social-cross-posting.md) or [OG image generation](seo.md).

## Slugs

The slug defaults to the file id; override it with the `slug` frontmatter field.
