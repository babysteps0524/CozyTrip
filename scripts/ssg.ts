import { mkdir, readFile, writeFile } from "node:fs/promises";

import { join } from "node:path";

import { createElement } from "react";

import { renderToString } from "react-dom/server";

import App from "../src/App";

import { destinations } from "../src/data/destinations";

import { hotels } from "../src/data/hotels";

import { setRuntimePosts } from "../src/data/posts";

import { createSeoMetadata, SITE_NAME, SITE_URL } from "../src/lib/seo";

import type { HotelImage, Post } from "../src/types";

import { loadPosts } from "./lib/loadMarkdown";

const distDir = join(process.cwd(), "dist");

const indexPath = join(distDir, "index.html");

const manifestPath = join(distDir, ".vite", "manifest.json");

interface ManifestEntry {
  file: string;

  css?: string[];

  isEntry?: boolean;

  src?: string;
}

type Manifest = Record<string, ManifestEntry>;

function normalizeRoute(route: string): string {
  if (route === "/") {
    return "/";
  }

  return route.endsWith("/") ? route : `${route}/`;
}

function createRoutes(posts: Post[]): string[] {
  const routes = new Set<string>();

  routes.add("/");

  routes.add(normalizeRoute("/japan"));

  routes.add(normalizeRoute("/guides"));

  for (const destination of destinations) {
    routes.add(normalizeRoute(`/japan/${destination.slug}`));

    routes.add(normalizeRoute(`/japan/${destination.slug}/hotels`));
  }

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

  for (const post of posts) {
    if (post.category !== "guide") {
      continue;
    }

    routes.add(normalizeRoute(`/guides/${post.slug}`));
  }

  return Array.from(routes).sort();
}

async function loadManifest(): Promise<Manifest> {
  const manifestText = await readFile(manifestPath, "utf8");

  return JSON.parse(manifestText) as Manifest;
}

function getEntryAssets(manifest: Manifest) {
  const entries = Object.entries(manifest);

  const entry = entries.find(([, value]) => value.isEntry === true);

  if (!entry) {
    throw new Error("Vite entry was not found in manifest.");
  }

  const [manifestKey, manifestEntry] = entry;

  console.log(`Vite entry: ${manifestKey}`);

  return {
    script: `/assets/${manifestEntry.file}`,

    css: manifestEntry.css ?? [],
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createAbsoluteImageUrl(image: HotelImage): string {
  if (image.src.startsWith("http://") || image.src.startsWith("https://")) {
    return image.src;
  }

  const normalizedSrc = image.src.startsWith("/") ? image.src : `/${image.src}`;

  return `${SITE_URL}${normalizedSrc}`;
}

function injectSeoMetadata(html: string, route: string, posts: Post[]): string {
  const seo = createSeoMetadata(route, destinations, hotels, posts);

  const title = escapeHtml(seo.title);

  const description = escapeHtml(seo.description);

  const canonical = escapeHtml(seo.canonical);

  const siteName = escapeHtml(SITE_NAME);

  const tags: string[] = [
    `<title>${title}</title>`,

    `<meta name="description" content="${description}" />`,

    `<link rel="canonical" href="${canonical}" />`,

    `<meta property="og:type" content="${seo.ogType}" />`,

    `<meta property="og:site_name" content="${siteName}" />`,

    `<meta property="og:title" content="${title}" />`,

    `<meta property="og:description" content="${description}" />`,

    `<meta property="og:url" content="${canonical}" />`,

    `<meta property="og:locale" content="ko_KR" />`,
  ];

  if (seo.image) {
    const imageUrl = escapeHtml(createAbsoluteImageUrl(seo.image));

    const imageAlt = escapeHtml(seo.image.alt);

    tags.push(`<meta property="og:image" content="${imageUrl}" />`);

    tags.push(
      `<meta property="og:image:width" content="${seo.image.width}" />`,
    );

    tags.push(
      `<meta property="og:image:height" content="${seo.image.height}" />`,
    );

    tags.push(`<meta property="og:image:alt" content="${imageAlt}" />`);

    tags.push(`<meta name="twitter:image" content="${imageUrl}" />`);
  }

  tags.push(`<meta name="twitter:card" content="summary_large_image" />`);

  tags.push(`<meta name="twitter:title" content="${title}" />`);

  tags.push(`<meta name="twitter:description" content="${description}" />`);

  let result = html;

  result = result.replace(/<title>[\s\S]*?<\/title>/i, "");

  result = result.replace(/<meta\s+name=["']description["'][^>]*>/gi, "");

  result = result.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "");

  result = result.replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, "");

  result = result.replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, "");

  result = result.replace("</head>", `    ${tags.join("\n    ")}\n  </head>`);

  return result;
}

function injectAssets(html: string, script: string, css: string[]): string {
  const cssTags = css
    .map((file) => `<link rel="stylesheet" href="/${file}">`)
    .join("\n");

  const scriptTag = `<script type="module" src="${script}"></script>`;

  const sourceScript = '<script type="module" src="/src/main.tsx"></script>';

  if (!html.includes(sourceScript)) {
    return html;
  }

  return html.replace(sourceScript, `${cssTags}\n    ${scriptTag}`);
}

function createDocument(
  template: string,
  route: string,
  posts: Post[],
  script: string,
  css: string[],
): string {
  const appElement = createElement(App, {
    initialPath: route,

    destinations,

    hotels,

    posts,
  });

  const appHtml = renderToString(appElement);

  let html = template.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`,
  );

  html = injectSeoMetadata(html, route, posts);

  html = injectAssets(html, script, css);

  return html;
}

async function writeRoute(route: string, html: string): Promise<void> {
  const routePath = route === "/" ? distDir : join(distDir, route);

  await mkdir(routePath, {
    recursive: true,
  });

  await writeFile(join(routePath, "index.html"), html, "utf8");
}

async function main(): Promise<void> {
  console.log("Loading Markdown content...");

  const posts = await loadPosts();

  console.log(`Loaded ${posts.length} post(s).`);

  setRuntimePosts(posts);

  const template = await readFile(indexPath, "utf8");

  const manifest = await loadManifest();

  const { script, css } = getEntryAssets(manifest);

  const routes = createRoutes(posts);

  console.log(`Generating ${routes.length} route(s)...`);

  for (const route of routes) {
    const html = createDocument(template, route, posts, script, css);

    await writeRoute(route, html);

    console.log(`  ✓ ${route}`);
  }

  console.log(`SSG generated ${routes.length} route(s).`);
}

await main();
