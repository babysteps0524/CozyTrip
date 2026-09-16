import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>CozyTrip | 일본 호텔과 여행 정보</title>
    <link>https://cozytrip.kr/</link>
    <description>
      일본 호텔과 여행 정보를 소개하는 CozyTrip
    </description>
    <language>ko</language>
  </channel>
</rss>
`;

await mkdir(distDir, {
  recursive: true,
});

await writeFile(join(distDir, "rss.xml"), rss, "utf8");

console.log("RSS generated.");
