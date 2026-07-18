// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://nickbodmer.com',
  integrations: [mdx(), sitemap()],
  markdown: {
    // css-variables theme maps Shiki token colors onto the design tokens
    // (--tok-*) defined in src/styles/global.css, so code blocks follow
    // light/dark automatically.
    shikiConfig: { theme: 'css-variables' },
  },
  redirects: {
    // micro.blog-era URLs — keep inbound links and feed subscribers working
    '/archive': '/posts/',
    '/about': '/',
    '/2025/06/28/taming-the-home-lab-friendly.html': '/posts/taming-the-home-lab-friendly/',
    '/2024/06/12/spacial-vision-livestream.html': '/posts/spacial-vision-livestream/',
    '/2023/09/05/magbak-rimcase-for.html': '/posts/magbak-rimcase-for/',
    '/2023/09/05/today-i-was.html': '/posts/today-i-was/',
    '/2023/08/14/replacing-the-battery.html': '/posts/replacing-the-battery/',
    '/2023/08/10/swiftdata-errors-in.html': '/posts/swiftdata-errors-in/',
    '/2023/07/09/deploying-your-app.html': '/posts/deploying-your-app/',
    '/2023/07/03/should-i-wait.html': '/posts/should-i-wait/',
    '/2023/05/28/busy-day.html': '/posts/busy-day/',
    '/2023/05/17/which-mac-desktop.html': '/posts/which-mac-desktop/',
    '/2023/05/17/photochromic-sunglasses-generic.html': '/posts/photochromic-sunglasses-generic/',
    // 2018 post recovered from the official .bar export (absent from the live feed)
    '/unboxed-a-new': '/posts/unboxed-a-new/',
  },
});
