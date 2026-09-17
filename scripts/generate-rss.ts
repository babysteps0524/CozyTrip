import { mkdir, writeFile } from "node:fs/promises";

import { join } from "node:path";

import { loadPosts } from "./lib/loadMarkdown";

const distDir = join(process.cwd(), "dist");

const siteUrl = "https://cozytrip.kr";

const siteTitle = "CozyTrip | 일본 호텔과 여행 정보";

const siteDescription = "일본 호텔과 여행 정보를 소개하는 CozyTrip";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function createPostUrl(slug: string): string {
  return `${siteUrl}/guides/${slug}/`;
}

function createRssItem(post: {
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
}): string {
  const title = escapeXml(post.title);

  const description = escapeXml(post.description);

  const link = createPostUrl(post.slug);

  const pubDate = new Date(post.publishedAt).toUTCString();

  return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
}

function createRss(
  posts: {
    title: string;
    slug: string;
    description: string;
    publishedAt: string;
  }[],
): string {
  const items = posts.map(createRssItem).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss
  version="2.0"
>
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${siteUrl}/</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>ko</language>
    <atom:link
      href="${siteUrl}/rss.xml"
      rel="self"
      type="application/rss+xml"
    />

${items}

  </channel>
</rss>
`;
}

async function main(): Promise<void> {
  console.log("Loading Markdown content for RSS...");

  const posts = await loadPosts();

  const publishedPosts = posts
    .filter((post) => post.category === "guide")
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  const rss = createRss(publishedPosts);

  await mkdir(distDir, {
    recursive: true,
  });

  await writeFile(join(distDir, "rss.xml"), rss, "utf8");

  console.log(`RSS generated: ${publishedPosts.length} post(s).`);
}

await main();
