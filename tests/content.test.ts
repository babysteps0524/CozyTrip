import { describe, expect, test } from 'bun:test';
import { hotels, regions, guides } from '../src/data/site';
import { attractions } from '../src/data/attractions';

describe('static content integrity', () => {
  test('hotel slugs are unique and URL-safe', () => {
    const slugs = hotels.map((hotel) => hotel.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))).toBe(
      true,
    );
  });
  test('each hotel refers to an existing region', () => {
    const slugs = new Set(regions.map((region) => region.slug));
    expect(hotels.every((hotel) => slugs.has(hotel.region))).toBe(true);
  });
  test('all guides and regions have required content', () => {
    expect(
      guides.every(
        (guide) => guide.title.length > 5 && guide.excerpt.length > 20,
      ),
    ).toBe(true);
    expect(
      regions.every(
        (region) => region.intro.length > 20 && region.areas.length > 0,
      ),
    ).toBe(true);
  });
  test('example hotel content is not represented as published/verified', () => {
    expect(hotels.every((hotel) => hotel.status !== 'published')).toBe(true);
    expect(hotels.every((hotel) => hotel.sourceNote.length > 10)).toBe(true);
  });
  test('attraction slugs are unique and URL-safe', () => {
    const slugs = attractions.map((attraction) => attraction.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))).toBe(
      true,
    );
  });
  test('each attraction refers to an existing region', () => {
    const regionSlugs = new Set(regions.map((region) => region.slug));
    expect(
      attractions.every((attraction) => regionSlugs.has(attraction.regionSlug)),
    ).toBe(true);
  });
  test('example attraction content is not represented as published', () => {
    expect(
      attractions.every((attraction) => attraction.status !== 'published'),
    ).toBe(true);
    expect(
      attractions.every((attraction) => attraction.sourceNote.length > 10),
    ).toBe(true);
  });
});
