import { getCollection } from 'astro:content';
import { renderPostHtml } from '../lib/render-post.js';

// JSON Feed 1.1 at /feed.json — same path micro.blog used.
export async function GET(context) {
  const site = String(context.site);
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Nick Bodmer',
    description: 'Enthusiastically sharing curiosity.',
    home_page_url: site,
    feed_url: new URL('/feed.json', site).href,
    language: 'en-US',
    authors: [{ name: 'Nick Bodmer', url: site }],
    items: posts.map((post) => ({
      id: new URL(`/posts/${post.id}/`, site).href,
      url: new URL(`/posts/${post.id}/`, site).href,
      ...(post.data.title ? { title: post.data.title } : {}),
      content_html: renderPostHtml(post, context.site),
      date_published: post.data.date.toISOString(),
    })),
  };
  return new Response(JSON.stringify(feed, null, 2), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
}
