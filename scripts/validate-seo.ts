import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

import { destinations } from "../src/data/destinations";
import { hotels } from "../src/data/hotels";
import { posts } from "../src/data/posts";

const distDir = join(process.cwd(), "dist");

function routeFile(route: string): string {
  return join(distDir, route === "/" ? "index.html" : route, "index.html");
}

function assertIncludes(html: string, value: string, label: string): void {
  if (!html.includes(value)) {
    throw new Error(`SEO validation failed: ${label}`);
  }
}

async function validateRoute(
  route: string,
  checks: Array<[string, string]>,
): Promise<void> {
  const file = routeFile(route);
  await access(file);
  const html = await readFile(file, "utf8");

  for (const [value, label] of checks) {
    assertIncludes(html, value, `${route} - ${label}`);
  }
}

async function main(): Promise<void> {
  const checks: Array<Promise<void>> = [];

  checks.push(
    validateRoute("/", [
      ["<title>", "title"],
      ['<link rel="canonical"', "canonical"],
    ]),
  );

  for (const destination of destinations) {
    const destinationRoute = `/japan/${destination.slug}/`;
    const hotelListRoute = `/japan/${destination.slug}/hotels/`;

    checks.push(
      validateRoute(destinationRoute, [
        [`<title>${destination.name} 호텔 및 여행 정보`, "destination title"],
        [`https://cozytrip.kr/japan/${destination.slug}/`, "destination canonical"],
      ]),
    );

    checks.push(
      validateRoute(hotelListRoute, [
        [`<title>${destination.name} 호텔 추천 및 숙소 정보`, "hotel list title"],
        ['"@type":"ItemList"', "hotel list JSON-LD"],
      ]),
    );
  }

  for (const hotel of hotels) {
    const destination = destinations.find(
      (item) => item.id === hotel.destinationId,
    );
    if (!destination) continue;

    const route = `/japan/${destination.slug}/hotels/${hotel.slug}/`;
    checks.push(
      validateRoute(route, [
        ['"@type":"Hotel"', "Hotel JSON-LD"],
        ['"@type":"BreadcrumbList"', "Breadcrumb JSON-LD"],
      ]),
    );

    const hotelPost = posts.find(
      (post) => post.category === "hotel" && post.hotelId === hotel.id,
    );
    if (hotelPost) {
      checks.push(
        validateRoute(route, [
          ['"@type":"FAQPage"', "FAQ JSON-LD"],
        ]),
      );
    }
  }

  for (const post of posts.filter((item) => item.category === "guide")) {
    checks.push(
      validateRoute(`/guides/${post.slug}/`, [
        [`<title>${post.title} | CozyTrip 코지트립`, "guide title"],
      ]),
    );
  }

  await Promise.all(checks);
  console.log(`SEO validation passed: ${checks.length} route checks.`);
}

await main();
