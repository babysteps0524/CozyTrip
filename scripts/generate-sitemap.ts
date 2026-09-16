import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");

const siteUrl = "https://cozytrip.kr";

const routes = ["/"];

const urls = routes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route}</loc>
  </url>`,
  )
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${urls}
</urlset>
`;

await mkdir(distDir, {
  recursive: true,
});

await writeFile(join(distDir, "sitemap.xml"), sitemap, "utf8");

console.log(`Sitemap generated: ${routes.length} URL(s).`);
