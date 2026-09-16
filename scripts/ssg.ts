import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const indexPath = join(distDir, "index.html");

const html = await readFile(indexPath, "utf8");

const routes = ["/"];

for (const route of routes) {
  const routePath = route === "/" ? distDir : join(distDir, route);

  await mkdir(routePath, {
    recursive: true,
  });

  await writeFile(join(routePath, "index.html"), html, "utf8");
}

console.log(`SSG generated ${routes.length} route(s).`);
