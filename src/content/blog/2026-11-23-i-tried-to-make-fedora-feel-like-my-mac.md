---
title: 'I Tried to Make Fedora Feel Like My Mac'
description: 'Two weeks with AeroSpace and Neru made my Mac almost mouse-free. Then I tried to rebuild the same setup on Fedora 45 with Sway, keyd and fuzzel, and gave up.'
date: 2026-11-23
tags: ['macos', 'linux', 'fedora', 'productivity', 'window-management']
draft: false
---

So, let me start of with a confession: I was a Windows guy for most of my life.
I switched to a Mac a half a year ago, and I really wanted to hate it.
But I had to admit after using it for a while: It is so much better than I expected.
It's fast, smooth, and surprisingly intuitive once you get used to the ideas behind it and my muscle memory adjusted.
But where light is, there is also shadow.
From the beginning, I missed one crucial feature: a window manager that actually worked for me.
On Windows, the windows were easy to manage.
You could snap them to the sides, move them around freely, and with PowerToys FancyZones, you could even create custom layouts for your windows.
And this is a crucial feature when you work on an ultra-wide 49" monitor like I do.

So I searched for an alternative that works on Mac in a similar way.
And I found [Rectangle](https://rectangleapp.com/), which worked well enough for basic window snapping.
Rectangle is fine.
You press a shortcut, the window snaps to the left half, and you move on.
But I still spent a surprising part of my day hunting for windows with Cmd+Tab, or reaching for the mouse to search for them on the screen.
One thing I still don't get on Mac: Why are windows of the same application not switchable via Cmd+Tab?
However, I got used to it and accepted the limitations of macOS window management.

But then, about two weeks ago, I had the urge to try something new.
I replaced Rectangle with [AeroSpace](https://github.com/nikitabobko/AeroSpace) and [Neru](https://github.com/y3owk1n/neru).
The first two days were confusing.
Then the shortcuts stuck, I tweaked the config a bit, and now I don't want to go back.
So naturally, the next thing I did was try to get the same setup on my Linux machine.
That part went less well.
But I will get to that later.
First, let's talk about AeroSpace on macOS.

## AeroSpace: windows that stay where I put them

AeroSpace is a tiling window manager for macOS, built in the style of [i3](https://i3wm.org/).
New windows don't float around and pile on top of each other.
They split the screen with the windows that are already there, and you move focus between them with the keyboard.
AeroSpace also brings its own workspaces instead of using macOS Spaces, so there is no slide animation and no guessing which Space a window went to.
And it does all this without asking you to turn off System Integrity Protection, which is the main reason I never tried yabai.

The thing that made it work for me is one workspace per app.
My terminal always lives on workspace T, VS Code on C, the browser on B, and so on.
An `on-window-detected` rule sends every new window to its workspace, so I never sort windows by hand:

```toml
[[on-window-detected]]
if.app-id = 'com.mitchellh.ghostty'
run = ['layout tiling', 'move-node-to-workspace T']

[[on-window-detected]]
if.app-id = 'com.brave.Browser'
run = 'move-node-to-workspace B'
```

Getting to an app is now one chord and zero thinking.
Ctrl+Alt+B is the browser and Ctrl+Alt+T is the terminal, every time, no matter how many windows are open.
The digits are scratch workspaces for whatever does not have a home yet.

![Holding Ctrl and Alt plus a letter jumps to one app's workspace: T for Ghostty, C for VS Code, I for IntelliJ, B for Brave, M for Teams and Outlook, D for Docker. The digits 1 to 5 are scratch workspaces. Adding Shift moves the focused window there instead.](/images/aerospace-workspaces.svg)

You might wonder why the modifier is Ctrl+Alt and not just Alt, like in the default config.
I type on a German keyboard, and on a German Mac layout, Alt (Option) is how you type `@`, `[`, `]`, `{`, `}`, `|` and `~`.
The default config binds Alt+L to "focus right".
Alt+L is the `@` sign.

There is a second German keyboard trap.
AeroSpace reads keys by their position on a US keyboard, so symbol keys end up somewhere else on QWERTZ.
I only bind letters, digits and named keys like Tab, and not even all letters, because Y and Z swap places.

A few smaller things finished the setup.
Resizing lives in its own mode: Ctrl+Alt+R, then H, J, K and L grow or shrink the window, and Escape goes back.
I run with zero gaps between windows, which looks clean but makes it hard to see which window has focus.
[JankyBorders](https://github.com/FelixKratz/JankyBorders) fixes that by drawing a thin border around the active window, and AeroSpace starts it on login:

```toml
after-startup-command = [
  'exec-and-forget borders active_color=0xffe1e3e4 inactive_color=0xff494d64 width=5.0'
]
```

## Neru: clicking without the mouse

AeroSpace solved the windows.
Inside a window, I still needed the mouse.

Neru fixes that part.
Think of [Vimium](https://vimium.github.io/), but for the whole operating system.
You press a shortcut, every clickable thing on screen gets a small label, you type the label, and Neru clicks it.
It finds those elements through the macOS accessibility tree, so it works in native apps, Electron apps and the browser alike.

```toml
[hotkeys]
"Primary+Shift+Space" = "hints"
"Primary+Shift+G" = "grid"
"Primary+Shift+S" = "scroll"
```

`Primary` means Cmd on macOS.
Hint mode is the one I use all day.
Grid mode splits the screen into labeled cells that you narrow down step by step, which helps in apps that don't tell the accessibility tree about their buttons.
Scroll mode gives you Vim keys for scrolling: J and K, `gg` for the top, Shift+G for the bottom.

The two tools don't know about each other, but one line in the AeroSpace config makes them work together:

```toml
on-focus-changed = ['move-mouse window-lazy-center']
```

Neru's scroll mode scrolls whatever is under the mouse pointer.
Without this line, I would switch to the browser with the keyboard, press J, and scroll the terminal I just left.
With it, the pointer follows keyboard focus into the new window, and scroll mode scrolls the window I'm looking at.

Add [Raycast](https://www.raycast.com/) for launching apps, and my hands now leave the keyboard for maybe one or two things per hour.
I love it!

## Then I installed Fedora

I also use a Linux machine, and I wanted the same muscle memory there.
I installed [Fedora 45 Workstation](https://fedoraproject.org/workstation/), which ships GNOME on Wayland.
There is no X11 session to fall back on anymore, and that matters, because many of the classic Linux desktop tools were written for X11.

Here is what I tried as a replacement for each piece:

| On the Mac         | What I tried on Fedora | How it went                  |
| ------------------ | ---------------------- | ---------------------------- |
| AeroSpace          | Sway, PaperWM, Mosaic  | Gave up                      |
| Neru               | Neru (Linux beta)      | Nothing happened under Sway  |
| Raycast            | fuzzel                 | Works, but it is not Raycast |
| Mac-like shortcuts | keyd                   | Never got it to do anything  |

### Sway

On paper, [Sway](https://swaywm.org/) is the obvious answer.
It uses the i3 config format, it tiles windows with the keyboard, and it runs natively on Wayland.
One `sudo dnf install sway`, pick Sway on the login screen, done.

Then GNOME was gone.
Not changed, gone.
The top bar became a dark strip with workspace numbers and a clock.
No menus, no quick settings, no notification center.
The whole thing looked rough and felt clunky.
And there was no way to sign out or shut down the computer.
The default config has exactly one way out: Mod+Shift+E, which shows a bar at the top of the screen asking if you really want to exit Sway.
Exit Sway, that is.
Turning off the computer was not part of the offer.

<figure>
  <img src="/images/memes/travolta.gif" alt="Confused Travolta meme: a man looks around in a room." width="480" height="473" loading="lazy" />
  <figcaption>Me in Sway, looking for a shutdown button.</figcaption>
</figure>

None of this is a bug.
Sway is a compositor, not a desktop environment.
Everything GNOME gave me for free, the bar, the launcher, notifications, the power menu, screen locking, is a separate project in Sway world that you pick, install and configure yourself.
People do this, and their screenshots on [r/unixporn](https://www.reddit.com/r/unixporn/) look amazing.
Those setups are also someone's hobby for months.
I wanted my shortcuts back, not a new hobby.

Next up was Neru.
Neru runs on Linux too, and its [platform docs](https://github.com/y3owk1n/neru/blob/main/docs/reference/platform-support.md) list wlroots compositors like Sway as supported, in beta.
On my machine, nothing happened.
I pressed the hotkey and got no hints, no grid, no error.
Just my desktop, staring back.

For Raycast, I used [fuzzel](https://codeberg.org/dnkl/fuzzel), a small app launcher for Wayland.
It is fast and it works.
But Raycast is also my clipboard history, window search, calculator and snippet tool.
fuzzel launches apps.
That is the job, and it does the job, but next to Raycast it feels like going from a smartphone back to a pager.

Then [keyd](https://github.com/rvaiya/keyd), a daemon that remaps keys at a very low level, below the desktop.
The idea was to get Mac-style shortcuts back I created with Karabiner-Elements on my Mac, so my fingers would not have to learn a second set of shortcuts on Linux.
keyd is not in Fedora's own repos, so it means a COPR repo or building from source.
I installed it, wrote the config, started the service, and pressed the keys.
They did exactly what they did before.

<figure>
  <img src="/images/memes/surprised-pikachu.jpg" alt="Surprised Pikachu meme: Pikachu with its mouth wide open." width="360" height="360" loading="lazy" />
  <figcaption>Me after installing a system-wide key remapper and watching every key do exactly what it did before.</figcaption>
</figure>

And as a small final touch, even zsh-autosuggestions didn't work as it did on my Mac.
I was frustrated.

### Back to GNOME: PaperWM and Mosaic

Plan B was to keep GNOME and add tiling with an extension.
[PaperWM](https://github.com/paperwm/PaperWM) puts your windows on an endless horizontal strip that you scroll through.
[Mosaic](https://extensions.gnome.org/extension/8502/mosaic/) is based on GNOME's own ideas for rethinking window management.
Both were closer to usable than Sway, because I got my top bar and my shutdown button back.

Neither one worked well for me, though.
They behaved the way extensions tend to behave: mostly fine, with rough edges, and with the steady feeling that the next GNOME update could break them.
After a while I was not tuning my setup anymore.
I was just trying out extensions until one felt less wrong.

<figure>
  <img src="/images/memes/clown-applying-makeup.jpg" alt="Clown applying makeup meme: in four steps, a man puts on white face paint, red lips, a rainbow wig and finally a red nose." width="260" height="603" loading="lazy" />
  <figcaption>Installing Sway. Installing keyd. Trying PaperWM. Trying Mosaic.</figcaption>
</figure>

## Why I gave up

On the Mac, everything just worked once it was configured.
AeroSpace is one `brew install` and a TOML file.
Neru is the same.
They come from different developers and don't know about each other, yet they work together, because macOS gives both of them the same window model and the same accessibility API.

On Linux, each tool hooks into a different layer.
Sway is the compositor.
keyd sits on kernel input.
Neru reads AT-SPI for accessibility.
PaperWM and Mosaic are GNOME Shell extensions.
Which of these can talk to which depends on the compositor you picked, and every change felt like it might break something somewhere else.
I wasn't configuring a system.
I was negotiating with one.

<figure>
  <img src="/images/memes/hide-the-pain-harold.jpg" alt="Hide the Pain Harold meme: an older man smiles at the camera while his eyes look clearly unhappy." width="360" height="451" loading="lazy" />
  <figcaption>Me, telling people this is the year of the Linux desktop, while unlocking my Mac.</figcaption>
</figure>

To be fair, this is not Linux being bad.
Plenty of people run Sway or Hyprland every day, and their setups are faster than mine will ever be.
But they built them piece by piece, over a long time.
I wanted to rebuild a two-week-old Mac setup quickly, and that is just not how the Linux desktop works.
Maybe I'll try again with KDE or Hyprland at some point.
Not this month.
