# Handoff: nickbodmer.com — personal site

## Overview
A personal website for Nick Bodmer (nickbodmer.com): home/landing, blog index, blog post, apps, and CV pages, unified by one design system. The guiding idea is Nick's mission statement — **"Enthusiastically sharing curiosity."** — expressed as a warm, quiet, durable design: system fonts, generous whitespace, one amber accent plus two companion hues, light + dark themes.

## About the Design Files
The `.dc.html` files in this bundle are **design references created in HTML** — high-fidelity prototypes showing intended look and behavior, not production code to ship. **`site.css` is the exception: it was written as production-grade vanilla CSS and can be lifted nearly verbatim.**

**Target: a static Astro site.** Semantic HTML + vanilla CSS only — no React, no Tailwind, no CDN assets. Recreate each page as an Astro page/layout; the markup inside each mock's `<x-dc>` wrapper is already semantic HTML you can adapt directly. Ignore the DC scaffolding (`<x-dc>`, `<helmet>`, the `data-dc-script` block, `support.js`); the small JS in each file only powers preview-time theme/font toggles and is NOT needed in production.

## Fidelity
**High-fidelity.** Colors, type scale, spacing, and copy are final unless marked as placeholder. Recreate pixel-perfectly.

## Design Tokens (source of truth: `site.css` `:root` blocks)
All colors are oklch. Light theme:
- `--bg` oklch(0.985 0.006 85) warm paper white · `--bg-subtle` oklch(0.962 0.008 85)
- `--text` oklch(0.26 0.015 60) · `--text-muted` oklch(0.51 0.02 60)
- `--accent` (amber) oklch(0.54 0.13 55) · `--accent-strong` oklch(0.47 0.13 50)
- `--accent-teal` oklch(0.54 0.10 200) · `--accent-berry` oklch(0.54 0.11 345)
- `--border` oklch(0.89 0.012 80)

Dark theme (via `prefers-color-scheme: dark`, and force-override with `data-theme="dark"`/`"light"` on `<html>` if a manual toggle is ever added):
- `--bg` oklch(0.215 0.012 65) · `--text` oklch(0.90 0.012 80)
- `--accent` oklch(0.76 0.115 65) · `--accent-teal` oklch(0.76 0.09 200) · `--accent-berry` oklch(0.76 0.10 345)
- Full list plus code-token colors (`--tok-*`) in `site.css`.

Type: **system font stacks only, zero webfonts.** Body and headings both `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`; headings weight 700 with `-0.015em` tracking; mono `ui-monospace, "SF Mono", Menlo, Consolas`. Fluid type scale `--step--1` … `--step-3` (clamp-based, in site.css). Note: site.css still contains unused alternate font variants (`data-fonts` blocks) and Google Fonts `<link>`s in the mocks — those were exploration; **delete them for production.**

Spacing: `--space-1` (0.25rem) … `--space-8` (5rem). Content measure `--measure: 42rem`, radius 8px.

Background: the body carries a three-color radial "glow" wash (amber top-right, teal left, berry bottom-right), intensity factor `--glow-k: 1.7` (the shipped value; a factor of 1 was the original subtler look). Removed entirely in print.

## Signature details (do not lose these)
- Wordmark "Nick Bodmer" ends with an amber period; the period turns berry on hover.
- Nav links hue-coded: Posts=berry, Apps=amber, CV=teal; current page colored + weight 600 via `aria-current="page"`.
- Section `h2`s: 9px colored dot + heading text in the section's hue (set per-section with inline `--dot`).
- Mission line "Enthusiastically sharing curiosity." lives ONLY in the footer of every page — small italic with an amber marker-highlight (`.mission` class: gradient underline-highlight). It was deliberately moved out of the hero.
- Descriptor line under the name: muted text with teal/berry colored separator dots (phrases themselves stay muted — colored phrases were tried and rejected).
- App color coding used everywhere: League Rewind=teal, Closed=amber, P10=berry (card tints via `--tint`, name dots).
- Blog `h2`s inside articles are amber; year markers on the blog index are amber.

## Screens
### Home (`Home.dc.html`)
Section order matters: intro (84px circular avatar + name + descriptor + 3-sentence bio) → **Things I've made** (3 tinted app cards: name, one-liner, "iOS · App Store ↗" with PLACEHOLDER links `apps.apple.com/app/id000000000{1,2,3}`) → **Elsewhere** (2-col link list on ≥34rem, 1-col on phones: service name left, mono handle right, dotted bottom border; email/RSS/podcast as a prose line beneath) → **Recent posts** (4 titles + dates) → footer.

### Blog index (`Posts.dc.html`)
Chronological list grouped by amber year headings, 16 posts 2017–2025. Six titles are real; the rest are plausible placeholders Nick will replace. Title left, tabular-nums date right.

### Blog post (`Post.dc.html`)
Real post: "Taming the Home Lab: Friendly Local Domains with UniFi + Pi-hole + NPM" (Jun 28, 2025). Demonstrates: syntax-highlighted code blocks (shell + YAML; token classes `.tok-c/.tok-k/.tok-s/.tok-v/.tok-p` themed in both modes — in Astro, map these to your highlighter, e.g. Shiki with a custom theme), responsive 16:9 YouTube embed (`.video-embed` wrapper; mock shows a placeholder), inline images (`<figure>` + caption), prev/next nav. This layout doubles for app-announcement posts (App Store badges/screenshots go inline as figures).

### Apps (`Apps.dc.html`)
One quiet section per app (h2 in the app's hue, 1–2 sentence description, platform + placeholder App Store link, "Related posts" list). Apps and posts cross-link both ways.

### CV (`CV.dc.html`)
Two-column entries (date rail 8.5rem left, content right; stacks on mobile). Real anchor: **Sales Engineer at Everpure Data, 2023–present**. All other roles/bullets are marked placeholders pending Nick's LinkedIn data. **The employer must appear only on this page** — never on home/apps/blog. Print styles: header/footer/nav hidden, colors to near-black, backgrounds removed (`@media print` in site.css).

## Interactions & Behavior
- Themes: pure `prefers-color-scheme`; no toggle shipped (the `data-theme` hooks exist if one is wanted later).
- Links: amber, 1px underline with 0.15em offset; hover darkens/brightens + 2px underline.
- Focus: 2px accent outline, 2px offset, on `:focus-visible` — keep on every interactive element (WCAG AA is a requirement in both themes).
- No JS required anywhere except an eventual copy-to-clipboard nicety if desired. RSS links are `#rss` placeholders — point to the real feed.
- Mobile-first: single column; Elsewhere list collapses to 1 col; nav wraps; hit targets ≥44px.

## Assets
- Avatar (circular, 84px on home) and blog inline screenshot are drop-in slots — Nick supplies real images.
- No icon set, no stock imagery, no webfonts.

## Files
- `site.css` — the design system (tokens + all component styles). Production-ready apart from the noted exploration leftovers.
- `Home.dc.html`, `Posts.dc.html`, `Post.dc.html`, `Apps.dc.html`, `CV.dc.html` — page mocks.
