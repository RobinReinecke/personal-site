---
title: "Why My Server's CPU Would Not Go to Sleep"
description: 'What package C-states and PCIe ASPM are, how one hidden BIOS setting and a cautious network driver kept my Proxmox host awake, and what fixing it did to power consumption.'
date: 2026-11-16
tags: ['home-server', 'proxmox', 'hardware', 'linux']
series: 'Home Server'
draft: false
---

A home server spends most of its life doing nearly nothing.
Mine streams a film in the evening, syncs a few photos, and answers some requests from my phone.
The rest of the day it waits.
So the number that decides its electricity bill is not how much power it draws under load, it is how much it draws while waiting.

When I built the new machine, which I described in the [first post of this series](/blog/2026-08-25-starting-over-on-my-home-server), I set a target of 15 to 25 watts at idle, measured at the wall.
The first measurement came in at 11 to 16 watts on an empty Proxmox host.
Better than the target, so I called it done for now.

It was not done.
The processor was stuck in a shallow sleep state the whole time, and the reason was one BIOS setting that hid a feature from Linux, plus a network driver that was being careful on purpose.
Now the server idles at around 10 watts with all services running.
This post explains what was going on, which needs a bit of background first.

## What "idle" means for a CPU

A modern CPU does not just run or stop.
When it has nothing to do, it can go into one of several sleep states, called C-states.
`C0` means working.
Higher numbers mean deeper sleep: more parts of the chip switched off, less power used, but a longer time to wake up again.

Think of an office building at night.
The first step is turning off the lights in empty offices.
The next step is turning down the heating on empty floors.
The deepest step is shutting down whole floors, including the elevators.
Each step saves more energy, and each step takes longer to undo when someone shows up at 7am.

There are two levels of this, and the difference is the key to this whole post.

Each core has its own C-states.
That is the single office turning off its lights.

The whole processor package also has C-states, written `PC2`, `PC3`, up to `PC10`.
The package is everything around the cores: the memory controller, the PCIe controller, the built-in GPU, the connections to the chipset.
That is the building's heating, elevators and lobby.
The package can only go into a deep state when all cores are asleep, and when everything connected to it agrees that it can be quiet for a while.

My cores were doing great.
The package was not.

## The symptom

`turbostat` shows how much time the cores and the package spend in each sleep state.
I ran it on the idle Proxmox host:

```bash
turbostat --quiet --show Pkg%pc2,Pkg%pc3,Pkg%pc6,Pkg%pc8,PkgWatt --interval 10
```

The cores were in their deepest state, `CC7`, 90 to 98 percent of the time.
The package spent 66 percent of its time in `PC3` and never got any deeper.
`PC6` and `PC8` were at 0 percent.

Cores asleep, package awake.
In building terms: every office is dark, but the elevators still run all night.
That pattern points away from the CPU and away from a busy process.
If a process were keeping the system busy, the cores would be awake too.
Something outside the cores was telling the package to stay ready.

The usual suspect for that is a PCIe device.

## PCIe links can sleep too

Everything fast in a PC talks to the processor over PCIe (Peripheral Component Interconnect Express): the NVMe SSDs, the network card, a graphics card if there is one.
Each of those connections is a link with two ends, the root port on the processor or chipset side, and the device on the other side.

These links have their own power saving feature, called ASPM (Active State Power Management).
The state that matters here is `L1`.
In `L1`, a link that has nothing to send powers down its transmitters, and it wakes up again when traffic arrives.

I like to think of it as a phone line between two people who agree to hang up when nobody is talking, and call back when there is something to say.
That only works if both sides agree to it.
If either end does not support `L1`, the line stays open.

And here is the connection to the package: the package cannot go below `PC3` while any of those links is awake.
One awake link is enough.
It is like one loading dock in the building that says "a delivery could arrive any second", so the lobby stays lit and the security guard stays at the desk.

So the question became: which link was awake, and why?

## My first attempt, and why I gave up too early

Linux has a setting that decides how aggressively it uses ASPM.
On Proxmox you set it on the kernel command line:

```
pcie_aspm.policy=powersupersave
```

I added that, rebooted, and `dmesg` confirmed that the operating system had control over ASPM.
I had also set the ASPM options in the BIOS to `L1` while building the machine.
But every device still reported ASPM as disabled.

There was one strange detail.
The only PCIe port that switched to "ASPM enabled" was an empty one, with nothing plugged into it.

At the time I knew that Realtek network chips on Linux have a reputation for ASPM trouble.
So I blamed the network card, accepted that I was losing maybe 3 to 5 watts, and moved on.
11 to 16 watts was already below my target.
I wrote "good enough" in my notes and started migrating services.

The network card was indeed part of the problem.
But it was not the only part, and it was not the first part.

## Capability versus control

A week later I came back to it and read the `lspci -vv` output more carefully.
For each PCIe link, it shows two fields that sound almost the same:

- `LnkCap` is what the link is capable of. It is set by the hardware and firmware, and the operating system can only read it.
- `LnkCtl` is what is currently switched on. The operating system can change this one.

```bash
lspci -vv | grep -E '^[0-9a-f]|LnkCap:.*ASPM|LnkCtl:.*ASPM'
```

The devices themselves, both WD SN850X SSDs and the Realtek RTL8125 network chip, all reported `ASPM L1` in their `LnkCap`.
They were happy to sleep.
But every root port that had a device behind it reported `LnkCap: ASPM not supported`.
The only root port that claimed support was the empty one.

A restaurant analogy helped me here.
`LnkCap` is the menu, and `LnkCtl` is the order.
Linux was ready to order `L1` for every table.
But the BIOS had removed `L1` from the menu at every table where someone was actually sitting.
The only table with the full menu was the empty one.

That also explains my first attempt.
Linux was configured correctly the whole time.
It just cannot turn on a feature that the hardware tells it does not exist.
No kernel setting was ever going to fix this.

## The hidden BIOS switch

The board is a Gigabyte B760M DS3H DDR4.
I had set `PEG ASPM`, `PCH ASPM` and `DMI ASPM` to `L1` during the build.
Those options cover the processor's PCIe lanes, the chipset's lanes, and the link between processor and chipset.
They looked right.

The missing piece was somewhere else in the menu:

**Settings → Platform Power → Platform Power Management**

It ships disabled.
While it is disabled, the ASPM options are hidden and have no effect, even if you set them earlier.
It is the main switch for the whole section, and it sat in a different place than the options it controls.
Thanks for that Gigabyte, ever heard of User Experience?

After enabling it, both SSD links negotiated `L1` on their own, with no further changes.
And `turbostat` showed... almost nothing.
I was disappointed.
`PC3` dropped from 66 to 51 percent, and `PC6` and `PC8` were still at 0.

One link was still awake.

## The cautious network driver

That link was the network card.
The RTL8125 now advertised `L1` and its root port did too, but `LnkCtl` still showed ASPM disabled on both ends.

This time it was the driver.
Linux's `r8169` driver deliberately turns off ASPM for this chip.
Early hardware revisions of the RTL8125 sometimes failed to wake up from `L1` at 2.5 gigabits, and losing your network connection is much worse than losing a few watts.
So the driver plays it safe for every revision, including the fixed ones.
It is like a rule written for an old elevator model that sometimes got stuck between floors, still applied to every elevator from that manufacturer.

Linux lets you override this for a single device through sysfs:

```bash
echo 1 > /sys/bus/pci/devices/0000:04:00.0/link/l1_aspm
```

`0000:04:00.0` is the network card's PCI address on my machine.
The moment I ran that command, the package changed completely:

| Stage                         | PC2  | PC3   | PC6   | PC8         |
| ----------------------------- | ---- | ----- | ----- | ----------- |
| Before                        | 16 % | 66 %  | 0 %   | 0 %         |
| BIOS fix only                 | 13 % | 51 %  | 0 %   | 0 %         |
| BIOS fix + network card in L1 | 14 % | 1–2 % | 3–8 % | **26–47 %** |

`PC3` did not get smaller, it almost disappeared.
The package now skipped it and went straight down to `PC8`.

The order matters here.
The BIOS fix alone changed almost nothing you could measure.
But without it, the network card setting would have had nothing to turn on, because the root port would still have claimed it did not support `L1`.
Each fix was useless without the other.

## Testing before trusting it

The driver's default exists for a reason, so I did not want to make this permanent based on one good `turbostat` reading.
The specific risk is a network card that does not wake up properly from `L1`.
On a headless server, that means a machine I can only fix with a keyboard and a monitor.

So I tested it from a second machine.
This has to be a separate physical computer.
Traffic between the Proxmox host and its own VMs goes through a software bridge and never touches the network card.

```bash
# on the Proxmox host
iperf3 -s

# on another machine: ten minutes of full load in each direction
iperf3 -c <pve-ip> -t 600
iperf3 -c <pve-ip> -t 600 -R

# the harder test: short bursts with idle gaps between them
for i in $(seq 1 60); do iperf3 -c <pve-ip> -t 5; sleep 20; done
```

The last loop is the important one.
Constant load keeps the link awake, so it does not test waking up at all.
Five seconds of traffic followed by twenty seconds of silence makes the link enter `L1` and wake up again sixty times.
That is exactly the situation where the old hardware bug showed up.

I watched `dmesg -w` on the host the whole time, looking for link resets, `NETDEV WATCHDOG` messages or PCIe errors.
Nothing appeared.
Afterwards, `ethtool` still showed the full link speed and `ip -s link` showed zero errors and zero dropped packets.
Only then did I make it permanent with a small systemd unit:

```ini
[Unit]
Description=Enable ASPM L1 for Realtek RTL8125 (r8169 disables it by default)
After=network.target

[Service]
Type=oneshot
ExecStart=/bin/sh -c 'echo 1 > /sys/bus/pci/devices/0000:04:00.0/link/l1_aspm'
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

Undoing it is one command, `echo 0` into the same file.

## Two shortcuts I did not take

When you search for this problem, two quick fixes come up again and again.

The first is the kernel option `pcie_aspm=force`.
It tells Linux to ignore what `LnkCap` says and enable ASPM anyway.
In restaurant terms, you order the dish that is not on the menu and hope the kitchen can make it.
That would have skipped exactly the safety check that was blocking me.
My Proxmox system runs on a ZFS mirror across the two NVMe SSDs.
If an SSD drops off the bus because it was forced into a power state the platform did not agree to, I do not get a slow server, I get one that might not boot.
With the BIOS fixed properly, `force` was never needed.

The second is Realtek's own `r8125` driver, which handles ASPM itself and is a bit faster.
It is an out-of-tree kernel module, so it needs to be rebuilt with DKMS on every Proxmox kernel update.
That puts third-party code between a headless server and its only network connection, on every update, forever.
A one-line sysfs setting I can undo in a second felt like the better trade.

## What it was worth

The server now idles at around 10 watts at the wall, down from 11 to 16.
That is a few watts, which does not sound like much.
But the server runs all year, and at German electricity prices each watt running around the clock costs roughly 3€ a year.
It will not pay for anything exciting.
It does mean the box in the corner draws about as much as an LED bulb while it waits for someone to start a film.

Honestly, the money was never the main point.
I wanted to understand why the numbers looked wrong, and "the Realtek chip is just like that" was an explanation I had accepted without checking it.
It was half true, which is the most dangerous kind of explanation, because it stops you from looking further.

There are two things I still keep an eye on.
`PC8` sits at 26 to 47 percent, not higher.
The next suspect is the built-in GPU, which belongs to the package and is passed through to the Docker VM, as I described in the [GPU post](/blog/2026-10-07-using-my-servers-gpu-for-jellyfin-and-immich).
A device held awake by the passthrough driver can limit the package too.
I will only chase that if another wall measurement says it is worth it.

The other one is that hardcoded PCI address in the systemd unit.
If I ever add a card to the free x16 slot, say a 10 gigabit network card, the addresses can shift.
The unit would then write to the wrong path, fail quietly, and the package would drop back to `PC3` without telling anyone.
That is now a line in my notes for the day the new card arrives, and probably the most likely way this whole fix gets undone.
