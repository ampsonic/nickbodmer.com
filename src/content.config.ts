import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    // absent on untitled micro posts — lists render a muted pseudo-title
    title: z.string().optional(),
    date: z.coerce.date(),
    source: z.enum(['hugo', 'microblog', 'new']).default('new'),
    // original micro.blog path, e.g. /2025/06/28/slug.html (provenance + redirect map)
    originalUrl: z.string().optional(),
    // slug of an app in src/data/apps.json — powers /apps "Related posts"
    app: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
