---
title: "Taming the Home Lab: Friendly Local Domains with UniFi + Pi‑hole + NPM"
date: 2025-06-28
source: microblog
originalUrl: "/2025/06/28/taming-the-home-lab-friendly.html"
---

Last week I finally hit my breaking point with URLs like `http://192.168.1.10:32400`. Sure, I _can_ remember that Plex runs on port 32400… but what about Home Assistant? Or my random test container from three months ago? My brain already holds enough useless trivia—memorizing port numbers doesn’t need to be part of the collection.

I wanted a clean, memorable way to reach every self‑hosted service on my network—`plex.home.arpa`, `pihole.home.arpa`, `npm.home.arpa`, you name it.

**First stop: Nginx Proxy Manager (NPM).** It’s the brains that maps each friendly hostname to the right internal port so I never type `:32400` again.

**The snag:** my UniFi Cloud Gateway Fiber can’t point a wildcard domain (`*.home.arpa`) straight at the NPM container, so NPM alone didn’t get me there.

**Enter Pi‑hole.** By taking over DNS, Pi‑hole answers every `*.home.arpa` query with the IP of my Mac mini—the box where NPM is listening. UniFi forwards DNS to Pi‑hole, Pi‑hole hands out the single IP, and NPM does the port‑mapping magic. Two tools, one neat solution.

> **Side note:** All my containers run inside [OrbStack](https://orbstack.dev/) using `docker compose`. **HTTP‑only for simplicity** – I’m keeping everything on plain HTTP inside the LAN.

Below is the final setup, why I chose each piece, and enough breadcrumbs for _Future Me_ (and maybe _Present You_) to recreate it without the usual home‑lab tinkering.

## Why I bothered

-   **Human‑friendly URLs** – I can type “plex” instead of an IP:port combo.
-   **Single entry point** – NPM puts every service behind one memorable domain.
-   **Ad‑blocking for free** – If Pi‑hole is already answering DNS, why not?
-   **One place to grow** – Adding a new service is a 10‑second NPM host rule.

## Gear & high‑level layout

| **Box** | **Role** | **Key Detail** |
| --- | --- | --- |
| **UniFi Cloud Gateway Fiber (UCG)** | Router / DHCP | Hands out itself (`192.168.1.1`) as DNS |
| **Mac mini (192.168.1.10)** | Docker host | Runs Pi‑hole + NPM + everything else |

DNS path in one breath: **Client → UCG → Pi‑hole → wildcard → NPM → internal service**.

## Step‑by‑step

### 1\. Deploy Pi‑hole & Nginx Proxy Manager containers

Spin up both services using OrbStack + `docker compose` (or your container runtime of choice).

_Pi‑hole defaults to port 80 for its admin UI, but that clashes with NPM’s reverse‑proxy listener, so I remapped Pi‑hole’s web interface to port 82 in my_ `docker‑compose.yml`_._

The only ports you need exposed are:

-   **Pi‑hole**: 53/udp + 53/tcp (DNS) and 82/tcp (web UI)
-   **NPM**: 80/tcp (reverse proxy) and 81/tcp (admin UI)

That’s it—we’ll skip the YAML here to keep things short.

### 2\. Point the UCG at Pi‑hole

1.  **Settings → Internet → DNS**

_Primary_: `192.168.1.10` (Pi‑hole)

_Secondary_: _(leave blank)_

I originally tried adding Cloudflare (`1.1.1.1`) as a backup so the household would stay online if the Mac mini went down. **Bad idea.** UniFi doesn’t strictly prefer the primary resolver—it will query the secondary even when the primary is healthy. Each time that happened Cloudflare returned **NXDOMAIN** for my internal hosts, the gateway cached the negative answer, and local lookups failed until I rebooted the gateway.

2.  **Settings → Network → LAN → DNS Mode**: **Auto**

DHCP keeps handing out `192.168.1.1` to clients. Behind the scenes, the gateway forwards everything to Pi‑hole, so if Pi‑hole ever goes down the network still feels alive.

### 3\. Add a wildcard override in Pi‑hole

In the Pi‑hole Admin UI, go to **Settings → All Settings → Miscellaneous → misc.dnsmasq\_lines** and paste:

```other
address=/.home.arpa/192.168.1.10
```

Click **Save & Restart DNS**. From now on, every `*.home.arpa` hostname resolves to the Mac mini.

### 4\. Create proxy hosts in NPM

Inside the NPM admin UI (`http://192.168.1.10:81`), add a **Proxy Host** for each service:

|  |  |
| --- | --- |
| Domain | Forward To |
| `plex.home.arpa` | `http://192.168.1.10:32400` |
| `npm.home.arpa` | `http://192.168.1.10:81` |
| `pihole.home.arpa` | `http://192.168.1.10:82` |

Because we’re sticking with HTTP internally, there’s no SSL checkbox to worry about. It Just Works.

Open the browser—no ports, no IPs, just **plex.home.arpa**. Victory.

### TL;DR Config Recap

```other
Clients            → DNS 192.168.1.1 (UCG)
UCG (forward DNS)  → 192.168.1.10 (Pi‑hole)
Pi‑hole wildcard   → *.home.arpa → 192.168.1.10
NPM port 80        → Reverse‑proxy to service ports
```

Simple, memorable hostnames and one less mental lookup table.

Future Nick, if you’re troubleshooting this at 2 a.m., you’re welcome.
