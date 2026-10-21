import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const hotelSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(2),
  city: z.string().min(1),
  summary: z.string().min(40),
  status: z.enum(['draft', 'needs_review', 'approved', 'published']).default('draft'),
  sources: z.array(z.object({ url: z.string().url(), label: z.string().min(2), checkedAt: z.string().date() })).default([]),
  affiliateUrl: z.string().url().optional(),
  imageRights: z.enum(['owned', 'licensed', 'approved_feed', 'needs_review', 'unknown']).default('unknown'),
  factsVerified: z.boolean().default(false),
});

const root = join(dirname(fileURLToPath(import.meta.url)), '../src/content/hotels');
const files = (await readdir(root)).filter((name) => name.endsWith('.json'));
let failed = false;
for (const file of files) {
  try {
    const raw: unknown = JSON.parse(await readFile(join(root, file), 'utf8'));
    const result = hotelSchema.safeParse(raw);
    if (!result.success) {
      failed = true;
      console.error(`✗ ${file}: ${result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
    } else {
      const item = result.data;
      const publishReady = item.status === 'approved' && item.factsVerified && item.sources.length > 0 && item.imageRights !== 'unknown' && item.imageRights !== 'needs_review';
      console.log(`${publishReady ? '✓' : '•'} ${file}: ${publishReady ? 'publish checks passed' : 'valid data; not approved for publishing'}`);
    }
  } catch (error) {
    failed = true;
    console.error(`✗ ${file}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
if (files.length === 0) console.log('No hotel JSON files found. Add a source-backed hotel record to validate.');
if (failed) process.exitCode = 1;
