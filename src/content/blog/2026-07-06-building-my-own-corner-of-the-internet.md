---
title: 'Building My Own Corner of the Internet'
description: 'Why I decided to build a personal website (again)'
date: 2026-07-06
tags: ['astro', 'content', 'web']
draft: false
---

Every few months I have the same thought: my personal information and content lives on platforms I do not own, formatted by rules I did not set, in front of an algorithm I cannot see.
So this year I finally did something about it and built this site.

## Why bother, when Instagram, LinkedIn, and Medium already exist

Social platforms are convenient, but convenience is not the same as ownership.
A post on LinkedIn is one algorithm change away from reaching nobody.
A Medium article sits behind a paywall I do not control.
Neither gives me a URL I can point to in ten years and trust that it still looks the way I intended.

I still want the reach those platforms if I choose to share there, so this is not a boycott.
It's just a more intentional way of information sharing: publish here first, distribute everywhere else second.

## What it needed to be

A few constraints shaped every decision:

- No database, no admin panel, no server process to babysit at 2am.
- Posts are markdown files. Fixing a typo is a pull request, not a login.
- It runs on my own home server, not a platform that can raise prices or shut down.
- No comments, no newsletter, nothing that needs daily moderation.

## How it is built

The site is [Astro](https://astro.build), rendered to plain static HTML at build time.
Pages that do not need interactivity do not ship any client-side JavaScript, which keeps things fast without much effort on my part.

The look borrows the _shadcn_ design tokens (colors, radii, spacing) rather than starting from a blank canvas, then layers a bit of personality on top: a teal accent, a subtle network background, and a few details I plan to keep refining.

Content lives as markdown and MDX files under version control.
Publishing a post is a normal commit.
When a new post lands on the main branch, a small pipeline drafts the LinkedIn post and opens a dev.to draft automatically, but nothing goes out the door without me reading it first and pressing publish myself.

Analytics run through a self-hosted Umami instance instead of a third-party tracker, so visits stay between me and my own server.

## What is next

The plan is simple: create when I have something worth sharing, keep the infrastructure boring enough that it never gets in the way, and let the site slowly fill up with whatever I have been deep in lately.
