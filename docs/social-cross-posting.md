# Social cross-posting

The pipeline turns a published blog post into review-ready social drafts. **Nothing is posted
automatically.**

## Draft generation

On every push to `main` that adds/modifies a **non-draft** post,
[.github/workflows/social-draft.yml](../.github/workflows/social-draft.yml) runs
[scripts/social/generate-drafts.ts](../scripts/social/generate-drafts.ts) to build:

- LinkedIn copy,
- an **unpublished** dev.to draft (requires the `DEVTO_API_KEY` repo secret).

It then opens a GitHub Issue with everything to review. LinkedIn and X are copy-paste from the
issue.

## Publishing

The dev.to draft only goes live when you manually run
[.github/workflows/social-publish.yml](../.github/workflows/social-publish.yml)
(`workflow_dispatch`) via [scripts/social/publish.ts](../scripts/social/publish.ts) with the
post's slug.

## Notes

- dev.to only allows alphanumeric tags — `generate-drafts.ts` strips non-alphanumeric characters
  and caps tags at 4.
- These scripts are non-trivial logic and should be covered per [testing.md](testing.md).
