---
title: "As Built: The Homelab That Runs This Site"
date: 2026-07-18
source: new
---

Notes to future me: what this site runs on, how the pieces fit, and the two things I'll actually need later — how to change this site, and how to stand up a new one.

## The stack

- **Hardware:** an Intel NUC running **Proxmox**
- **Platform:** **Coolify** in a VM on that Proxmox host
- **Each site:** a Docker container — a multi-stage build (a Node image builds the Astro site, an nginx image serves the static files) — built and run by Coolify from a GitHub repo
- **Ingress:** a **Cloudflare Tunnel** into Coolify's built-in Traefik proxy
- **DNS + TLS:** Cloudflare (nameservers, proxied records, edge certificates)
- **Deploys:** `git push` plus one Coolify API call

No ports are forwarded on the router. Nothing in the homelab is reachable from the internet except through the tunnel.

## How it was built

Two Claude sessions did the work:

- **Claude (design)** — I wrote a brief: the mission statement, the pages I wanted, real content, and hard constraints (system fonts, one accent color, light + dark, vanilla CSS). It produced a design system as CSS tokens plus HTML mockups of every page. That handoff is committed in the repo under `design/`.
- **Claude Code** — translated the design into an Astro static site, migrated every old post (Hugo + micro.blog) into `src/content/posts/`, and wired up the deploy. I made the decisions; it did the typing.

Source is public: [github.com/ampsonic/nickbodmer.com](https://github.com/ampsonic/nickbodmer.com).

## How Cloudflare routes a request

1. DNS for the domain lives at Cloudflare, proxied (orange cloud).
2. A **Cloudflare Tunnel** links my network to Cloudflare. The `cloudflared` connector dials *out*, so there's no inbound hole into the homelab.
3. In the tunnel's **public hostname** routes, the domain points at Coolify's Traefik proxy on the LAN.
4. Traefik reads the `Host` header and hands the request to the right site's container. Every site shares the one tunnel and the one proxy; the hostname is what separates them.
5. TLS is terminated at Cloudflare's edge, so the internal hop is plain HTTP. **Always Use HTTPS** is on, and `www` is a proxied CNAME with a redirect rule to the apex.

Because Traefik routes by hostname, I can test any site from the LAN before its DNS exists — just send the request to Coolify with the right `Host` header.

## Changing this site

Everything lives in a local checkout of the repo.

- **New post:** add a `.md` (or `.mdx` for a YouTube embed) to `src/content/posts/`. Frontmatter needs `title` and `date`; set `draft: false` when it's ready.
- **Preview locally:** `npm run dev`, or `npm run build && npm run preview` for the real static output.
- **Ship it:** `npm run deploy`.

`npm run deploy` pushes to GitHub and then calls Coolify's deploy API directly. A plain `git push` won't deploy on its own: Coolify isn't exposed to the internet, so GitHub's webhook can't reach it — the script is what tells Coolify to rebuild. (The API token lives in `.env.deploy`, gitignored — single-quote it, the token contains a `|`.)

## Standing up a new site

The repeatable version of what I just did:

1. **Build it** — Claude Code, into a GitHub repo. Include the `Dockerfile` + `nginx.conf` from this repo (styled 404, gzip, cached assets).
2. **Cloudflare zone** — point the domain's nameservers at Cloudflare.
3. **Coolify** — new app from the repo → Build Pack: **Dockerfile** → expose port 80 → set the domain → deploy.
4. **Tunnel route** — add a public hostname for the new domain, pointing at Coolify's Traefik. Same tunnel, same proxy; Traefik sorts it out by Host.
5. **Polish** — turn on Always Use HTTPS; add a `www` CNAME and a WWW→root redirect if wanted.
6. **One-command deploys** — copy `scripts/deploy.sh` and the `.env.deploy` pattern, set the new app's UUID (from its Coolify URL) and an API token.

That's the whole machine. Future me: if a deploy doesn't show up, it's almost always the webhook — just run `npm run deploy`.
