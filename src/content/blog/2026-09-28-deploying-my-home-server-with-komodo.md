---
title: 'Deploying My Home Server with Komodo'
description: 'Why I chose Komodo over Kubernetes and other options, and how a GitHub push deploys my Docker Compose stacks.'
date: 2026-09-28
tags: ['home-server', 'self-hosting', 'docker', 'komodo']
series: 'Home Server'
draft: false
---

In the [first post](/blog/2026-08-25-starting-over-on-my-home-server), I said the new server would run from a Git repo instead of a collection of files I had edited over SSH.
That is a nice rule until you have to pick the thing that turns your repo into running containers.
There are so many options that I spent a few days reading about.
Then I picked [Komodo](https://komo.do/docs/intro).

## Why Komodo

The old server ran Docker Compose files that I edited in place.
I wanted to keep Compose and change how those files reached the server.
The simplest fix would have been to put those files in Git, then SSH in and run `git pull && docker compose up -d` after every change (and yes, I've done that for some projects, but I wanted to avoid the SSH step with the new server.)
That would have been a real improvement, but it would have left the final step in my hands.
I know what happens to manual final steps when I change a container at 11pm.

I also considered Portainer, Ansible, NixOS, and Kubernetes.
Portainer could manage Git-backed Compose stacks, but Komodo gave me the workflow I wanted in one place: stacks tied to a repo, deployment on push, and a UI for checking what happened.
Ansible would have covered the Debian VM as well, including packages and mounts, but writing playbooks for every host detail felt like a lot of ceremony for one VM full of Compose services.
NixOS offered a more complete answer to reproducibility, at the price of learning a new configuration language while moving the household's actual services.
That can be a good project.
It was not the project I wanted this server to become.

Kubernetes was the most tempting wrong answer.
I could have run k3s with Flux or Argo CD and called the result GitOps, but then I would also own the [control plane, workload objects, networking, and storage setup](https://kubernetes.io/docs/concepts/).
I have one physical server.
If that machine dies, a scheduler has nowhere clever to put Jellyfin.
Kubernetes would have allow me to use my professional skills from work on my own server, which is a fair reason to use it, but it would not have made family photos easier to restore.

Komodo sits at the level I need.
It reads the Compose files I already understand, runs them on the Docker VM, and shows me the deployment result.
There is still another service to maintain, and a failed deploy can now mean a problem in either Compose or Komodo.
That trade is worth it for me because I no longer have to remember which stacks I changed and then log into the server to apply them.

## What lives in the repo

The layout is deliberately dull: one directory per stack under `stacks/`, with a `compose.yaml` in each.
Image versions, mounts, networks, and Traefik labels are all reviewable in Git.
The Vaultwarden stack shows the pattern without needing to display an entire Compose file:

```yaml
services:
  vaultwarden:
    image: vaultwarden/server:1.37.3
    volumes:
      - /opt/appdata/vaultwarden:/data
    environment:
      SOME_VARIABLE: ${SOME_VARIABLE}
```

The image is pinned, so an update is a deliberate edit rather than a surprise after a restart.
The bind mount puts Vaultwarden's data at a known path that I can back up.
The variable name lives in Git, but its value does not.
Komodo stores the secret and passes it to the stack at deploy time.

There are limits to what this repo can rebuild on its own.
The Debian VM's base setup has a runbook, and Komodo has to start before it can deploy anything else, so its own Compose project lives in the repo but is started separately.
Its database and the data under `/opt/appdata` need backups too.
Git can bring back a service definition; it cannot bring back the photos inside the service.
That distinction will matter a lot when I get to the backup post.

## From push to running stack

Each Komodo stack points at its directory in the GitHub repo.
A push sends a [webhook](https://komo.do/docs/automate/webhooks) to Komodo, where a [procedure](https://komo.do/docs/automate/procedures) checks the Compose stacks and deploys the ones whose definitions changed.
Traefik exposes only Komodo's `/listener/` path for GitHub, and the webhook uses a shared secret to verify the request.
The admin UI stays on the local network.
GitHub can ring the doorbell without getting a key to the house.
That is the part I had wanted from the start: edit a file, review the diff, push it, then check the deployment in the UI.
No SSH session with a half-remembered command, and a deployment log if what is running does not match the commit.

The procedure has one extra step for Traefik.
Its routing rules live in files next to `compose.yaml`, and a check that only looks for Compose changes would miss them.
So Traefik gets a deploy step on every push, allowing Komodo to pull those files and Traefik to reload its dynamic rules.
Changes to Traefik's static `traefik.yml` still need a restart, because Traefik only reads that file at startup.
The automation is useful, but it does not get to repeal how the software works.

## What all this is for

The Docker VM runs more than a deployment demo.
[Jellyfin](https://jellyfin.org/) handles media, [Immich](https://immich.app/) handles photos, and [Audiobookshelf](https://www.audiobookshelf.org/) handles the collection of audio books.
[Nextcloud](https://nextcloud.com/) covers files and some apps, [Vaultwarden](https://github.com/dani-garcia/vaultwarden) covers passwords, and Traefik routes requests to the right place.
There are supporting pieces for authentication and monitoring too, which are less interesting right up until one of them stops working.
There is more running on the server, but I keep some secrets for future posts.

Jellyfin and Immich also use the Intel iGPU in the Proxmox host.
Getting `/dev/dri` from that host into the Docker VM, and then into the containers with the right permissions, took considerably more thought than the phrase "enable hardware acceleration" suggests.
That deserves its own post.

For now, the useful result is smaller: I can open the repo, see what each service is meant to run, and push a change that reaches the right stack.
The server still needs backups, maintenance, and the occasional stubborn evening.
At least the next morning I can read the commit and remember what I did.
