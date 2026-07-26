# Deployment

The static output (`./dist`) is served by Caddy from a multi-stage Docker image.

```sh
docker build -t robinreinecke-site:latest .
docker compose up -d        # site + Umami analytics (Postgres-backed)
```

## Build image

[Dockerfile](../Dockerfile) is multi-stage: a Node stage runs `pnpm build`, then the built `dist`
is copied into a `caddy:2-alpine` runtime that serves `/srv`. Caddy config is
[Caddyfile](../Caddyfile).

## Analytics

[docker-compose.yml](../docker-compose.yml) runs the site alongside Umami analytics backed by
Postgres.

`PUBLIC_UMAMI_WEBSITE_ID` is a **build-time** Astro variable inlined into the static output, so it
must be present during the build (pass via `--build-arg` or compose `build.args`). It defaults to
empty, which disables the analytics tag — so it never needs to live in the source tree.

## CI

[.github/workflows/ci.yml](../.github/workflows/ci.yml) runs `format:check`, `lint`, `check`, and
`build` on every push and pull request. Keep it green.
