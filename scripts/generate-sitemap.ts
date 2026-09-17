import { mkdir, writeFile } from "node:fs/promises";

import { join } from "node:path";

import { destinations } from "../src/data/destinations";

import { hotels } from "../src/data/hotels";

import { loadPosts } from "./lib/loadMarkdown";

const distDir = join(process.cwd(), "dist");

const siteUrl = "https://cozytrip.kr";

function normalizeRoute(route: string): string {
  if (route === "/") {
    return "/";
  }

  return route.endsWith("/") ? route : `${route}/`;
}

function createRoutes(postSlugs: string[]): string[] {
  const routes = new Set<string>();

  /*
   * Home
   */
  routes.add("/");

  /*
   * Japan destination index
   */
  routes.add(normalizeRoute("/japan"));

  /*
   * Guide index
   */
  routes.add(normalizeRoute("/guides"));

  /*
   * Destination pages
   */
  for (const destination of destinations) {
    routes.add(normalizeRoute(`/japan/${destination.slug}`));

    routes.add(normalizeRoute(`/japan/${destination.slug}/hotels`));
  }

  /*
   * Hotel detail pages
   */
  for (const hotel of hotels) {
    const destination = destinations.find(
      (item) => item.id === hotel.destinationId,
    );

    if (!destination) {
      console.warn(`Destination not found for hotel: ${hotel.id}`);

      continue;
    }

    routes.add(
      normalizeRoute(`/japan/${destination.slug}/hotels/${hotel.slug}`),
    );
  }

  /*
   * Guide pages
   */
  for (const slug of postSlugs) {
    routes.add(normalizeRoute(`/guides/${slug}`));
  }

  return Array.from(routes).sort();
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function createSitemap(routes: string[]): string {
  const urls = routes
    .map((route) => {
      const loc = escapeXml(`${siteUrl}${route}`);

      return `  <url>
    <loc>${loc}</loc>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${urls}
</urlset>
`;
}

async function main(): Promise<void> {
  console.log("Loading Markdown content for sitemap...");

  const posts = await loadPosts();

  const guidePosts = posts.filter((post) => post.category === "guide");

  const routes = createRoutes(guidePosts.map((post) => post.slug));

  const sitemap = createSitemap(routes);

  await mkdir(distDir, {
    recursive: true,
  });

  await writeFile(join(distDir, "sitemap.xml"), sitemap, "utf8");

  console.log(`Sitemap generated: ${routes.length} URL(s).`);
}

await main();
