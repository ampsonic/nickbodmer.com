// One-shot importer: micro.blog feed snapshot → src/content/posts/*.md
// - localizes cdn.uploads.micro.blog images into public/images/posts/<slug>/
// - converts content_html to markdown (turndown), keeping YouTube iframes
//   wrapped in the design's responsive .video-embed container
// - emits scripts/output/redirects.json (old path → new path) for cross-checking
//   the redirect map in astro.config.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import TurndownService from 'turndown';
import { tables } from 'turndown-plugin-gfm';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const feed = JSON.parse(
  readFileSync(path.join(ROOT, 'scripts/data/feed-snapshot-2026-07-18.json'), 'utf8')
);

const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});
td.use(tables);
td.keep(['iframe']);

const RESIZABLE = /\.(jpe?g|png|webp|tiff?)$/i;
const MAX_WIDTH = 1600;

const redirects = {};

for (const item of feed.items) {
  const urlPath = new URL(item.url).pathname; // e.g. /2025/06/28/slug.html
  const slug = path.basename(urlPath, '.html');
  const title = (item.title ?? '').trim();

  // localize CDN images
  const cdnUrls = [...new Set(item.content_html.match(/https:\/\/cdn\.uploads\.micro\.blog\/[^\s"'<>)]+/g) ?? [])];
  const replacements = new Map();
  for (const cdnUrl of cdnUrls) {
    const base = decodeURIComponent(path.basename(new URL(cdnUrl).pathname))
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, '-');
    const dir = path.join(ROOT, 'public/images/posts', slug);
    const dest = path.join(dir, base);
    if (!existsSync(dest)) {
      mkdirSync(dir, { recursive: true });
      const res = await fetch(cdnUrl);
      if (!res.ok) throw new Error(`Download failed (${res.status}): ${cdnUrl}`);
      writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      if (RESIZABLE.test(base)) {
        const width = parseInt(
          execSync(`sips -g pixelWidth "${dest}"`).toString().match(/pixelWidth: (\d+)/)?.[1] ?? '0',
          10
        );
        if (width > MAX_WIDTH) execSync(`sips -Z ${MAX_WIDTH} "${dest}" >/dev/null`);
      }
    }
    replacements.set(cdnUrl, `/images/posts/${slug}/${base}`);
  }

  let markdown = td.turndown(item.content_html);
  for (const [from, to] of replacements) markdown = markdown.replaceAll(from, to);

  // kept iframes → responsive privacy-friendly embeds
  markdown = markdown.replace(/<iframe[^>]*src="([^"]+)"[^>]*>\s*<\/iframe>/g, (_m, src) => {
    const embedSrc = src.replace('www.youtube.com', 'www.youtube-nocookie.com');
    return `<div class="video-embed"><iframe src="${embedSrc}" title="YouTube video" loading="lazy" allowfullscreen></iframe></div>`;
  });

  const fm = ['---'];
  if (title) fm.push(`title: ${JSON.stringify(title)}`);
  // date_published carries the author-local offset (e.g. ...T19:33:01-07:00);
  // keep only the local calendar date so displayed dates match the original site
  fm.push(`date: ${item.date_published.slice(0, 10)}`);
  fm.push('source: microblog');
  fm.push(`originalUrl: ${JSON.stringify(urlPath)}`);
  fm.push('---', '', markdown, '');
  writeFileSync(path.join(ROOT, 'src/content/posts', `${slug}.md`), fm.join('\n'));

  redirects[urlPath] = `/posts/${slug}/`;
  console.log(`✓ ${slug}${title ? '' : ' (untitled)'}${cdnUrls.length ? ` — ${cdnUrls.length} image(s)` : ''}`);
}

mkdirSync(path.join(ROOT, 'scripts/output'), { recursive: true });
writeFileSync(path.join(ROOT, 'scripts/output/redirects.json'), JSON.stringify(redirects, null, 2));
console.log(`\n${feed.items.length} posts migrated. Redirect map → scripts/output/redirects.json`);
