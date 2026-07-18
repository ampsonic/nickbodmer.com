// Astro (static, format: 'directory') builds redirect routes that end in
// ".html" as directories: dist/2025/06/28/slug.html/index.html. A plain static
// server won't match those against a request for /2025/06/28/slug.html, so
// flatten each one into a real file at the exact legacy path.
import { readdirSync, statSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
let flattened = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (name.endsWith('.html')) {
      const html = readFileSync(path.join(p, 'index.html'));
      rmSync(p, { recursive: true });
      writeFileSync(p, html);
      flattened++;
    } else {
      walk(p);
    }
  }
}

walk(dist);
console.log(`Flattened ${flattened} .html redirect stub(s) into real files.`);
