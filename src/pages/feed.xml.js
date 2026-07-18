import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { renderPostHtml } from '../lib/render-post.js';
import { excerpt } from '../lib/post-utils';

// Served at /feed.xml — the same path micro.blog used, so existing
// subscribers keep working without redirects.
export async function GET(context) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
  return rss({
    title: 'Nick Bodmer',
    description: 'Enthusiastically sharing curiosity.',
    site: context.site,
    items: posts.map((post) => ({
      // untitled micro posts ship without <title>, per RSS 2.0
      ...(post.data.title ? { title: post.data.title } : {}),
      description: excerpt(post),
      pubDate: post.data.date,
      link: `/posts/${post.id}/`,
      content: renderPostHtml(post, context.site),
    })),
    customData: '<language>en-us</language>',
  });
}
