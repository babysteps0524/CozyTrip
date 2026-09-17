import { mkdir, readFile, writeFile } from "node:fs/promises";

import { join } from "node:path";

import { createElement } from "react";

import { renderToString } from "react-dom/server";

import App from "../src/App";

import { destinations } from "../src/data/destinations";

import { hotels } from "../src/data/hotels";

import { setRuntimePosts } from "../src/data/posts";

import type { Post } from "../src/types";

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

  const html = template.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`,
  );

  return injectAssets(html, script, css);
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
