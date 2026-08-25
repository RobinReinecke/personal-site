---
title: 'Starting Over on My Home Server'
description: 'Why I rebuilt a working home server from scratch, and the one rule that shaped every decision in the new one.'
date: 2026-08-25
tags: ['home-server', 'self-hosting', 'proxmox']
series: 'Home Server'
draft: false
---

My old home server worked fine, which is exactly why it was a problem.

It was an Ubuntu box that had grown organically over a couple of years.
A dozen or so Docker Compose files, each in its own folder, each edited in place over SSH whenever something needed changing.
Immich for photos, Jellyfin for media, Nextcloud, Vaultwarden, the usual self-hosted suspects.
Nothing was broken.
But nothing was written down either, and that is a different kind of broken that only shows up on the day you need it.

The thing I could never answer honestly was a simple one: if this disk died tonight, how long until everything is back?
The truthful answer was "a weekend, if I remember everything", and the part that bothered me was "if I remember".
The state of the server lived in the server.
There was no copy of the truth anywhere else, only my memory of which config I had hand-edited three months ago and never wrote down.

This is the first post in a series about rebuilding that setup properly.
Not because the old one was on fire, but because I wanted the boring kind of infrastructure that you can rebuild from a git repo instead of from memory.

## The problem with a server you edit in place

When you SSH into a box and edit a compose file, the change is live the moment you save it.
That feels great right up until you have twenty of those changes spread across a year.

The running state and any version you might have committed drift apart silently.
You bump an image tag to fix something at 11pm, it works, and you never write it down.
Three months later you have no idea whether the file on disk matches the last thing you thought you deployed.
There is no diff to look at, because there is nothing to diff against.

Backups help, but a backup of a mystery is still a mystery.
Restoring a `docker-compose.yml` tells you what was running.
It does not tell you why that image is pinned to an odd version, or which environment variable exists to work around a bug you fixed and forgot.

I wanted the opposite of that.
I wanted a setup where the answer to "what is running and why" is a repository I can read, and where getting back to a working state is a checkout and a deploy, not an archaeology project.

## One rule, everything else follows

The whole rebuild comes down to a single rule: the git repo is the single source of truth, and nothing runs that is not defined there.

That sounds obvious written down.
In practice it is the rule that kills the 11pm SSH edit, because an edit that only lives on the server violates it.
If I want to change something, I change it in the repo, commit it, and let the server converge to match.
The server stops being a place I log into and becomes a place that runs whatever the repo says.

The one exception I allowed myself is secrets, which never touch the repo.
Passwords, API keys, and tokens live outside git and get injected at deploy time.
Everything else, every service definition, every pinned version, every mount path, is a file I can read in a pull request.

Once that rule is fixed, most of the other decisions make themselves.
The deployment tool has to read from git.
Configuration has to be declarative.
Anything that cannot be expressed as a file in the repo needs a very good reason to exist, and gets documented as an exception rather than smuggled in.

## The shape of the new setup

The base is [Proxmox](https://www.proxmox.com/), which turns one physical machine into a hypervisor I can carve into VMs and containers.
On top of that runs a single Debian VM with Docker, and that VM holds nearly all the services.

Deployment is handled by [Komodo](https://komo.do/), which watches the repo and deploys the compose stacks from it.
Push a commit, and the server converges to match.
No SSH, no manual `docker compose up`, no wondering whether the running state matches the file.
The repo is the truth, Komodo makes reality agree with it, and I get a web UI to check status from the couch instead of a terminal.

I went with a proper little machine this time.
An Intel i5-14500, picked specifically for its Quick Sync video engine so Jellyfin can transcode 4K without melting the CPU.
64GB of RAM, and two WD Black SN850X 2TB drives in a ZFS mirror so a single dead disk is an inconvenience and not an incident.
It idles at around 35°C and tops out at 58°C under a stress test, which is quieter and cooler than I expected from a compact case stuffed this full.

I had this exact parts list sitting in a cart about a year ago, when it would have cost me roughly half.
Then I decided to wait a little, for reasons I can no longer reconstruct, and the market decided to wait right back.
DDR4 and NVMe prices went the wrong way in the meantime, so a few components ended up costing more than twice what they would have, and the RAM in particular now feels like a small act of financial self-harm.
There is no lesson here, other than that "I will buy it next month" is not a procurement strategy.

There is a lot more to say about each of those choices, which is rather the point of making this a series.

## What is coming

Over the next few posts I want to go into the parts that actually took thought and the ones that ate an afternoon.

The GitOps model with Komodo, and why I picked it over just running Portainer or writing an Ansible playbook.
Passing the Intel iGPU into the Docker VM for hardware transcoding, which sounds like one checkbox and is not.
Backups that I actually trust, including the offsite copy that ended up being a second small machine at another house rather than a rented bucket.
And the failure-domain thinking that decided DNS should live outside all of this, because the one service the whole house needs is the one you do not want sharing fate with your busiest VM.

The goal was never a clever server.
It was a boring one, in the good sense: something I can reason about, rebuild from a repo, and then mostly forget about.
The rest of the series is how I got there, decisions I am happy with and the ones I had to walk back included.
