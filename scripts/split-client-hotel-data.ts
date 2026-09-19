import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

interface HotelRecord {
  destinationId?: string;
}

interface GeneratedHotelFile {
  generatedAt?: string;
  source?: string;
  search?: Record<string, unknown>;
  imageUsageAllowed?: boolean;
  hotels?: HotelRecord[];
}

const destinations = ["tokyo", "osaka", "kyoto", "fukuoka", "sapporo", "okinawa"] as const;
const generatedDir = resolve(process.cwd(), "src/data/generated");
const outputDir = resolve(generatedDir, "client-hotels");

async function readGenerated(path: string): Promise<GeneratedHotelFile> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as GeneratedHotelFile;
  } catch {
    return { hotels: [] };
  }
}

async function main(): Promise<void> {
  const agoda = await readGenerated(resolve(generatedDir, "agoda-hotels.json"));
  const myRealTrip = await readGenerated(resolve(generatedDir, "myrealtrip-hotels.json"));

  const source =
    Array.isArray(agoda.hotels) && agoda.hotels.length > 0
      ? agoda
      : myRealTrip;

  const hotels = Array.isArray(source.hotels) ? source.hotels : [];

  await mkdir(outputDir, { recursive: true });

  for (const destination of destinations) {
    const destinationId = `japan-${destination}`;
    const destinationHotels = hotels.filter(
      (hotel) => hotel.destinationId === destinationId,
    );

    const output = {
      generatedAt: source.generatedAt ?? "",
      source: source.source ?? "none",
      hotelCount: destinationHotels.length,
      search: source.search ?? {},
      imageUsageAllowed: source.imageUsageAllowed ?? false,
      hotels: destinationHotels,
    };

    await writeFile(
      resolve(outputDir, `${destination}.json`),
      JSON.stringify(output, null, 2) + "\n",
      "utf8",
    );
  }

  console.log(
    `Client hotel data split complete: ${hotels.length} hotel(s) across ${destinations.length} destinations.`,
  );
}

await main();
