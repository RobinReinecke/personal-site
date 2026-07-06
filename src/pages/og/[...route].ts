import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { SITE_DESCRIPTION, SITE_TITLE } from '../../consts';

const posts = await getCollection('blog', ({ data }) => !data.draft);

// One entry per blog post (keyed `blog/<slug>`) plus a site-wide `default` card.
// Keys become the route: `blog/foo` -> /og/blog/foo.png, `default` -> /og/default.png
const pages: Record<string, { title: string; description: string }> = {
  default: { title: SITE_TITLE, description: SITE_DESCRIPTION },
};

for (const post of posts) {
  const slug = post.data.slug ?? post.id;
  pages[`blog/${slug}`] = {
    title: post.data.title,
    description: post.data.description,
  };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  // Route param `route` is inferred from the [...route] filename.
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    logo: {
      path: './src/assets/og-logo.png',
      size: [96],
    },
    // Bundled locally so builds never need the network.
    fonts: ['./src/assets/fonts/Inter-Bold.ttf', './src/assets/fonts/Inter-Regular.ttf'],
    font: {
      title: {
        color: [255, 255, 255],
        size: 64,
        lineHeight: 1.2,
        families: ['Inter'],
        weight: 'Bold',
      },
      description: {
        color: [161, 161, 170],
        size: 32,
        lineHeight: 1.4,
        families: ['Inter'],
      },
    },
    bgGradient: [
      [10, 12, 12],
      [16, 30, 28],
    ],
    border: { color: [33, 196, 174], width: 12, side: 'block-end' },
    padding: 70,
  }),
});
