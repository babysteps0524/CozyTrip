import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

import { destinations } from "../src/data/destinations";
import { hotels } from "../src/data/hotels";

const distDir = join(process.cwd(), "dist");

function normalizeRoutePath(route: string): string {
  const normalized = route.normalize("NFC");
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

async function collectIndexFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectIndexFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name === "index.html") {
      files.push(fullPath);
    }
  }

  return files;
}

function getHotelRoute(hotel: (typeof hotels)[number]): string | null {
  const destination = destinations.find(
    (item) => item.id === hotel.destinationId,
  );

  if (!destination) return null;

  return normalizeRoutePath(
    `/japan/${destination.slug}/hotels/${hotel.slug}`,
  );
}

function hasHotelPageImage(html: string): boolean {
  return /<img\b[^>]*\bsrc=["'][^"']+["'][^>]*>/i.test(html);
}

function hasMyRealTripImage(html: string): boolean {
  return /<img\b[^>]*\bsrc=["'][^"']*(?:myrealtrip|mrt)[^"']*["'][^>]*>/i.test(
    html,
  );
}

const files = await collectIndexFiles(distDir);
const fileByRoute = new Map<string, string>();

for (const file of files) {
  const route = `/${relative(distDir, file)
    .replaceAll("\\", "/")
    .replace(/index\.html$/, "")
    .replace(/^\/+/, "")
    .normalize("NFC")}`;

  fileByRoute.set(normalizeRoutePath(route), file);
}

const failures: string[] = [];
let checked = 0;
let myRealTripImages = 0;

for (const hotel of hotels) {
  const route = getHotelRoute(hotel);

  if (!route) {
    failures.push(`[${hotel.id}] destination not found for hotel.`);
    continue;
  }

  const file = fileByRoute.get(route);

  if (!file) {
    failures.push(`[${hotel.id}] missing SSG file for ${route}`);
    continue;
  }

  const html = await readFile(file, "utf8");
  checked += 1;

  if (!hasHotelPageImage(html)) {
    failures.push(
      `[${hotel.id}] ${route} has no hotel image in SSG HTML.`,
    );
  }

  if (hasMyRealTripImage(html)) {
    myRealTripImages += 1;
  }
}

console.log("SSG hotel article image validation complete.");
console.log(`Hotel routes checked: ${checked}`);
console.log(
  `Hotel routes with MyRealTrip image URLs: ${myRealTripImages}`,
);

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log("SSG hotel article image validation passed.");
