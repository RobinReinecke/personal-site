import { readFileSync } from 'node:fs';
import matter from 'gray-matter';

const SITE_URL = 'https://robinreinecke.de';
const DEVTO_API = 'https://dev.to/api/articles';

function slugFromPath(filePath: string): string {
  return filePath
    .split('/')
    .pop()!
    .replace(/\.(md|mdx)$/, '');
}

async function findUnpublishedDraft(apiKey: string, canonicalUrl: string) {
  const res = await fetch(`${DEVTO_API}/me/unpublished`, {
    headers: { 'api-key': apiKey },
  });
  if (!res.ok) {
    throw new Error(`dev.to API error: ${res.status} ${await res.text()}`);
  }
  const articles = (await res.json()) as Array<{ id: number; canonical_url: string | null }>;
  return articles.find((a) => a.canonical_url === canonicalUrl) ?? null;
}

async function publishDevtoDraft(apiKey: string, id: number) {
  const res = await fetch(`${DEVTO_API}/${id}`, {
    method: 'PUT',
    headers: { 'api-key': apiKey, 'content-type': 'application/json' },
    body: JSON.stringify({ article: { published: true } }),
  });
  if (!res.ok) {
    throw new Error(`dev.to API error: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: tsx publish.ts <path-to-post.mdx>');
    process.exit(1);
  }

  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) {
    console.error('DEVTO_API_KEY is required to publish.');
    process.exit(1);
  }

  const raw = readFileSync(filePath, 'utf-8');
  const { data } = matter(raw);
  const slug = data.slug ?? slugFromPath(filePath);
  const canonicalUrl = `${SITE_URL}/blog/${slug}/`;

  const draft = await findUnpublishedDraft(apiKey, canonicalUrl);
  if (!draft) {
    throw new Error(`No unpublished dev.to draft found with canonical_url ${canonicalUrl}`);
  }

  const published = await publishDevtoDraft(apiKey, draft.id);
  console.log(
    JSON.stringify({ slug, title: data.title, published: true, devto: published }, null, 2)
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
