import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { posts } from "../src/data/posts";

const outputDir = resolve(process.cwd(), "src/data/generated/client-posts");
const destinations = [
  "tokyo",
  "osaka",
  "kyoto",
  "fukuoka",
  "sapporo",
  "okinawa",
] as const;

async function main(): Promise<void> {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  const guides = posts.filter((post) => post.category === "guide");

  await writeFile(
    resolve(outputDir, "guides.json"),
    JSON.stringify(
      {
        postCount: guides.length,
        posts: guides,
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );

  let destinationPostCount = 0;

  for (const slug of destinations) {
    const destinationId = `japan-${slug}`;
    const destinationPosts = posts.filter(
      (post) => post.destinationId === destinationId,
    );

    destinationPostCount += destinationPosts.length;

    await writeFile(
      resolve(outputDir, `${slug}.json`),
      JSON.stringify(
        {
          destinationId,
          postCount: destinationPosts.length,
          posts: destinationPosts,
        },
        null,
        2,
      ) + "\n",
      "utf8",
    );
  }

  const files = await readdir(outputDir);

  console.log(
    `Client post data split complete: ${guides.length} guide post(s), ${destinationPostCount} destination post(s), ${files.length} JSON file(s).`,
  );
}

await main();
