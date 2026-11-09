---
title: 'My Network Bug Was Driving Me Crazy'
description: 'How a missing route on my old server made pfSense reset connections, why ping kept saying everything was fine, and why I blamed the switch first.'
date: 2026-11-09
tags: ['home-server', 'networking', 'pfsense', 'debugging']
series: 'Home Server'
draft: false
---

Halfway through moving my services from the old server to the new one, the two machines stopped talking to each other.
Not all the time, and not completely.
Just often enough to make every migration step feel like a coin toss.

This post is about how I found the cause, about the weeks I blamed the switch, and about the two days I then spent confidently looking in the wrong places.
If you only want the answer: the old server sometimes lost the route to its own subnet, and my firewall punished it for that.
The more useful part is why it took so long to see.

## The setup

During the migration, both servers lived on the same LAN segment, `192.168.50.0/24`.
The old Ubuntu server was `192.168.50.10`.
The new Docker VM on Proxmox, which I described in the [Komodo post](/blog/2026-09-28-deploying-my-home-server-with-komodo), was `192.168.50.51`.
A [pfSense](https://www.pfsense.org/) box routes between my VLANs and is the default gateway at `192.168.50.1`.

Two kinds of traffic went from new to old.
I copied data with `rsync`, and Traefik on the new server forwarded requests for services that had not moved yet, such as Jellyfin and Immich, to the old box.
Both broke in the same way.

## The symptoms

Everything was running fine until I started the migration process of a service by running `rsync` from the old server to the new one.
From that moment, the new server could not open any connection to the old one.
SSH, HTTP, anything.
Traefik started returning errors for every service that still lived on the old machine.

At the same time, a few other things were true:

- The new server could reach the internet and every other device on the LAN.
- A `ping` from the old server to the new one worked, and the replies came back.
- Rebooting the Docker VM did not help, and rebooting the whole Proxmox host did not help either.
- Power cycling the switch fixed it, every time.

In that moment I thought: Now I found the culprit.
The switch was an 8-port managed model with all ports in use, and it was the only thing that reliably made the problem go away.
I already started looking for a replacement.
I even started a list of the ways switches die: dried-out capacitors in the power supply, heat, a switching loop, a firmware memory leak.

## Why the switch reboot was weak evidence

Before ordering anything, I wrote down what the switch reboot actually did.
It did not only reset the switch.
It dropped the link on every port, including the old server's.
And the old server was the one machine in this whole story that I had never restarted.

So "the switch reboot fixes it" could also mean "a link reset on the old server fixes it".
Those two look identical from the outside.
That was the first moment I stopped trusting the obvious suspect, but it did not tell me what the real one was.

The ping result should have bothered me more, earlier.
If the switch had stopped forwarding frames between the two servers, the ping replies would have died too.
They did not.
Every direction of raw packet flow worked.
Only TCP connections from new to old failed.

## Capturing on the right side

The test that ended the switch theory was a packet capture on the old server, run while the fault was active.
I wanted to see the frames as the old server sent them, before any switch port touched them.

```bash
tcpdump -eni enp1s0 host 192.168.50.51
```

The `-e` flag prints the MAC addresses, and that was the whole point.
Here is the important part of what it showed:

```
30:9c:23… > bc:24:11…  ARP Reply 192.168.50.10 is-at 30:9c:23:ac:d9:af
30:9c:23… > 40:62:31…  ICMP echo reply → 192.168.50.51
```

The first line is the old server answering an ARP (Address Resolution Protocol) request from the VM.
ARP is how a machine finds out which MAC address belongs to an IP address on the local network, so at this point the old server clearly knew the VM was right there.
87 microseconds later, it sent its reply to `40:62:31…`.
That is not the VM's MAC address.
That is... drum roll... pfSense.

So the old server was not sending its replies to the VM directly.
It was handing them to the router, as if the VM were somewhere on the internet.
And it did this before the frame ever reached the switch.
A switch can drop, delay or flood a frame, but it cannot rewrite the destination MAC that the sender put in it.
The switch was out of the story.

## Why pfSense reset the connections

Once I knew the replies went through pfSense, the firewall log made sense:

```
VL50_SERVER: Default reject IPv4  192.168.50.10:8096 → 192.168.50.51:38708  TCP:SA
VL50_SERVER: Default reject IPv4  192.168.50.10:2283 → 192.168.50.51:38114  TCP:SA
```

Port 8096 is Jellyfin and 2283 is Immich, so these were exactly the Traefik requests that were failing.
`TCP:SA` means pfSense saw a SYN-ACK, the second packet of a TCP handshake.

Here is what happened, step by step:

1. The VM sends a SYN to the old server. Its routing is correct, so the packet goes directly to `.10`. pfSense never sees it.
2. The old server answers with a SYN-ACK, but sends it to pfSense instead of directly to the VM.
3. pfSense is a stateful firewall. It tracks every connection from its first packet. It has never seen this connection start, so a SYN-ACK out of nowhere looks like garbage.
4. The default rule on that interface is `reject`, not `block`. So instead of dropping the packet quietly, pfSense answers with a TCP reset, made to look like it came from the old server.
5. The VM gets an instant "connection reset". The old server thinks it answered politely. Nothing logs an error, except a firewall line I wasn’t looking at.

It is a bit like a letter you send to your neighbor, who writes back but gives the reply to the post office instead of walking it over.
The post office has no record of your original letter, so it sends you a note saying the neighbor refused it.
Everyone did something reasonable, and the result is nonsense.

This also explains the ping.
When the old server pinged the VM, the request went to pfSense, which knew where `.51` was and forwarded it.
The VM replied directly.
ICMP does not need the firewall to have seen a handshake, so it passed.
Only TCP needs pfSense to recognize a packet in the middle of a conversation, so only TCP broke.
A working ping proved that packets could move, not that connections could.

## Two wrong theories

At this point I had the mechanism but not the cause.
Why would the server send LAN traffic to its gateway?

My first confident answer was pfSense itself.
If pfSense were answering ARP requests for addresses it did not own, called proxy ARP, the old server could learn the wrong MAC for the VM.
I checked carefully.
No virtual IPs configured, no proxy ARP, `net.link.ether.inet.proxyall` set to `0`, no second interface in that subnet, no CARP.
pfSense was clean.

My second confident answer was two network managers fighting on the old server.
Ubuntu ran both NetworkManager and systemd-networkd, and that sounded like a perfect source of random behavior.
Then `nmcli device status` showed NetworkManager managing nothing at all.
Every interface was `unmanaged`, because netplan was configured with `renderer: networkd`.
Only systemd-networkd touched the network.

Both theories had the same problem.
I formed a mechanism first, then read each new piece of data as support for it.
That feels like progress while you do it.

## The mistake that cost me the most

There was a third mistake.
At some point I ran `ip route get 192.168.50.51` on the old server, and it returned a direct, on-link route.
I took that as proof that routing was fine, and moved on.

But I ran it after the fault had healed on its own.
A test taken after a self-healing problem has healed proves nothing.
The same command during the fault gave a very different answer.

## The actual cause

The next time the fault was active, I ran three commands on the old server:

```
$ ip neigh show 192.168.50.51
192.168.50.51 dev enp1s0 lladdr bc:24:11:65:bb:2a STALE

$ arping -c5 -I enp1s0 192.168.50.51
Unicast reply from 192.168.50.51 [BC:24:11:65:BB:2A]  1.411ms

$ ip route get 192.168.50.51
192.168.50.51 via 192.168.50.1 dev enp1s0 src 192.168.50.10
```

ARP was correct, and only one machine answered for `.51`.
But the route said `via 192.168.50.1`, through the gateway.
The routing table showed why:

```
default        via 192.168.50.1 dev enp1s0 proto dhcp src 192.168.50.10 metric 100
192.168.50.1   dev enp1s0 proto dhcp scope link src 192.168.50.10 metric 100
192.168.50.20  dev enp1s0 proto dhcp scope link src 192.168.50.10 metric 100
```

Something important is missing.
A Linux machine with the address `192.168.50.10/24` normally has a route like `192.168.50.0/24 dev enp1s0 scope link`, which says "everything in my own subnet is directly reachable on this cable".
That route was gone.
Without it, the old server only knew two LAN addresses by name, the gateway and the DNS server at `.20`, which came from DHCP.
Every other LAN address, including the VM, fell through to the default route and went to pfSense.

Those two single-host routes were actually a hint.
A DHCP client only adds routes like that when no subnet route covers those addresses.
They were the client working around the missing route, not the cause of it.

The route came and went because systemd-networkd applied the interface configuration again on DHCP lease renewals and restarts.
After some of those events the subnet route was there, after others it was not.
That is also the most likely reason the switch reboot helped: the link went down and up on the old server, networkd configured the interface again, and this time the route came back.
Now the bummer: I never found out exactly why networkd sometimes left it out.

## The boring fix

I could have kept digging into networkd's DHCP handling.
I decided not to, because I already invested enough mental energy into this topic.
A static configuration removed the whole problem:

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp1s0:
      dhcp4: no
      addresses: [192.168.50.10/24]
      routes:
        - to: default
          via: 192.168.50.1
      nameservers:
        addresses: [192.168.50.20]
```

I applied it with `netplan try`, which rolls back after 120 seconds unless you confirm it.
That is a good habit on a machine where a network mistake means walking to it with a keyboard (yes, that happened to me more than once).
Afterwards, `ip route show dev enp1s0` listed the subnet route, `ip route get 192.168.50.51` went directly to the VM without a `via`, and the problem has not come back since.

Since some `rsync` runs had stalled, I also checked every completed migration again with `rsync -aHAXn -c`.
The `-c` flag compares file contents by checksum instead of trusting size and date, and `-n` only reports differences without copying anything.
Everything matched.

## What I took from it

The switch is still getting replaced, but only because all eight ports are full.

There is one change I still want to make on pfSense: switch that interface's default rule from `reject` to `block`.
With `block`, the packet is dropped silently and the connection times out.
A timeout looks like a network problem.
An instant reset looks like the other side refusing you, which sent me looking at the wrong machine for far too long.

The rest is about method.
Capture packets on the machine you suspect, not somewhere in the middle.
Treat a working `ping` as proof that packets move, not that your application works.
And when a problem fixes itself, the evidence goes with it, so collect it while it is broken.
That last one is annoying, because the moment the problem appears is also the moment you most want it gone.
