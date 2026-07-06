import { readFileSync, writeFileSync } from 'node:fs';
import matter from 'gray-matter';

const SITE_URL = 'https://robinreinecke.de';
const DEVTO_API = 'https://dev.to/api/articles';

interface Frontmatter {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  slug?: string;
}

interface DevtoDraft {
  id: number;
  editUrl: string;
}

function slugFromPath(filePath: string): string {
  return filePath
    .split('/')
    .pop()!
    .replace(/\.(md|mdx)$/, '');
}

function buildLinkedInDraft(fm: Frontmatter, url: string): string {
  return `${fm.title}\n\n${fm.description}\n\nFull post: ${url}`;
}

function buildDevtoBody(fm: Frontmatter, body: string, url: string) {
  const tags = (fm.tags ?? []).slice(0, 4);
  const frontmatterBlock = [
    '---',
    `title: ${fm.title}`,
    'published: false',
    tags.length ? `tags: ${tags.join(', ')}` : null,
    `canonical_url: ${url}`,
    '---',
    '',
    body,
  ]
    .filter((line) => line !== null)
    .join('\n');
  return { title: fm.title, body_markdown: frontmatterBlock, tags };
}

async function createDevtoDraft(
  devtoBody: ReturnType<typeof buildDevtoBody>
): Promise<DevtoDraft | null> {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) {
    console.warn('DEVTO_API_KEY not set — skipping dev.to draft creation.');
    return null;
  }
  const res = await fetch(DEVTO_API, {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json' },
    body: JSON.stringify({
      article: {
        title: devtoBody.title,
        body_markdown: devtoBody.body_markdown,
        published: false,
        tags: devtoBody.tags,
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`dev.to API error: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { id: number; path: string };
  return { id: data.id, editUrl: `https://dev.to${data.path}/edit` };
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: tsx generate-drafts.ts <path-to-post.mdx>');
    process.exit(1);
  }

  const raw = readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const fm = data as Frontmatter;
  const slug = fm.slug ?? slugFromPath(filePath);
  const url = `${SITE_URL}/blog/${slug}/`;

  const linkedin = buildLinkedInDraft(fm, url);
  const devtoBody = buildDevtoBody(fm, content, url);
  const devto = await createDevtoDraft(devtoBody);

  const output = { slug, title: fm.title, url, linkedin, devto };
  writeFileSync('social-draft-output.json', JSON.stringify(output, null, 2));
  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
