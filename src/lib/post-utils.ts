import type { CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'posts'>;

/** Markdown/MDX body → plain text (for pseudo-titles and excerpts). */
function plainText(body: string): string {
  return body
    .replace(/^import\s.*$/gm, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_>`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Title, or a pseudo-title from the first ~8 words for untitled micro posts. */
export function postTitle(post: Post): string {
  if (post.data.title) return post.data.title;
  const words = plainText(post.body ?? '').split(' ');
  return words.slice(0, 8).join(' ') + (words.length > 8 ? '…' : '');
}

export function isUntitled(post: Post): boolean {
  return !post.data.title;
}

export function excerpt(post: Post, max = 160): string {
  const text = plainText(post.body ?? '');
  return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text;
}

export function sortByDateDesc(a: Post, b: Post): number {
  return b.data.date.valueOf() - a.data.date.valueOf();
}

/** Dates are date-only or ISO; format in UTC to avoid off-by-one. */
export function formatDate(date: Date, opts: { year?: boolean } = {}): string {
  const { year = true } = opts;
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    ...(year ? { year: 'numeric' } : {}),
  });
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
