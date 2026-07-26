# Testing

**Policy:** any non-trivial logic (data transformations, routing, schema handling, build-time
generators, the social scripts, utility functions) must be covered by a test or a documented
manual verification before the work is considered done.

## Current state

There is **no test runner configured** yet.

## Adding a runner

When you add logic that warrants automated testing, set up a lightweight runner (e.g. `vitest`)
and:

1. add a `test` script to [package.json](../package.json),
2. add the `test` step to [.github/workflows/ci.yml](../.github/workflows/ci.yml),
3. document how to run tests in this file.

## Until a runner exists

Cover important changes with a **documented manual verification** — record the exact commands run
and the expected result in the pull request or commit. Always confirm `pnpm check` and
`pnpm build` pass.

Prefer real tests over manual checks for anything reusable or non-obvious — especially the
build-time OG generator ([seo.md](seo.md)) and the `scripts/social/*` pipeline
([social-cross-posting.md](social-cross-posting.md)).
