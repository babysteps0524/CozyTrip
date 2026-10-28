import { describe, expect, test } from 'bun:test';
import { AgodaClient } from '../src/scripts/agoda-client';

const mockHotels = [
  {
    hotelId: 'mock-hotel-gracery-shinjuku',
    name: '호텔 그레이서리 신주쿠',
    city: '도쿄',
    area: '신주쿠',
    summary:
      '신주쿠 일대를 중심으로 여행 동선을 짜는 사람이라면 위치와 교통편을 먼저 비교해 볼 숙소 후보입니다.',
    officialUrl: 'https://www.agoda.com/ko-kr/hotel-gracery-shinjuku/',
    affiliateUrl: 'https://www.agoda.com/ko-kr/hotel-gracery-shinjuku/',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85',
    type: '도시 호텔',
    starRating: 4,
    reviewScore: 8.5,
    reviewCount: 1200,
    priceMin: 150000,
    currency: 'KRW',
    tags: ['도심 여행', '쇼핑', '교통 확인'],
  },
  {
    hotelId: 'mock-cross-hotel-kyoto',
    name: '크로스 호텔 교토',
    city: '교토',
    area: '가와라마치 인근',
    summary:
      '교토 중심부에서 관광지와 식당을 함께 살펴보려는 여행객에게 검토할 만한 숙소 후보입니다.',
    officialUrl: 'https://www.agoda.com/ko-kr/cross-hotel-kyoto/',
    affiliateUrl: 'https://www.agoda.com/ko-kr/cross-hotel-kyoto/',
    image:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=85',
    type: '도시 호텔',
    starRating: 4,
    reviewScore: 8.2,
    reviewCount: 950,
    priceMin: 180000,
    currency: 'KRW',
    tags: ['도심 산책', '미식', '위치 확인'],
  },
];

describe('AgodaClient (mock mode)', () => {
  test('searchHotels returns mock hotels filtered by city name', async () => {
    const client = new AgodaClient({
      mockMode: true,
      mockHotels,
      siteId: 'test-site',
      apiKey: 'test-key',
    });

    const results = await client.searchHotels({ cityId: '도쿄' });
    expect(results.length).toBe(1);
    expect(results[0]?.name).toBe('호텔 그레이서리 신주쿠');
  });

  test('searchHotels respects maxResult limit', async () => {
    const client = new AgodaClient({
      mockMode: true,
      mockHotels,
      siteId: 'test-site',
      apiKey: 'test-key',
    });

    const results = await client.searchHotels({ cityId: '도쿄', maxResult: 1 });
    expect(results.length).toBe(1);
  });

  test('searchHotels throws when neither cityId nor hotelId provided (real mode)', async () => {
    const client = new AgodaClient({ siteId: 'test-site', apiKey: 'test-key' });
    await expect(client.searchHotels({})).rejects.toThrow(
      'cityId 또는 hotelId 중 하나는 필수입니다.',
    );
  });

  test('searchHotels throws when auth missing (real mode)', async () => {
    // .env에 실제 키가 있을 수 있으므로 빈 인증 정보를 명시적으로 전달
    const client = new AgodaClient({
      mockMode: false,
      siteId: '',
      apiKey: '',
    });
    await expect(client.searchHotels({ cityId: '도쿄' })).rejects.toThrow(
      'Agoda API 인증 정보가 설정되지 않았습니다.',
    );
  });

  test('response field mapping matches Agoda PDF V2.0 schema', async () => {
    const client = new AgodaClient({
      mockMode: true,
      mockHotels,
      siteId: 'test-site',
      apiKey: 'test-key',
    });

    const results = await client.searchHotels({ cityId: '도쿄' });
    const hotel = results[0];

    expect(hotel).toBeDefined();
    expect(typeof hotel.priceMin).toBe('number');
    expect(hotel.currency).toBe('KRW');
    expect(hotel.name).toBe('호텔 그레이서리 신주쿠');
    expect(hotel.city).toBe('도쿄');
  });

  test('getHotelDetail returns mock hotel in mock mode', async () => {
    const client = new AgodaClient({
      mockMode: true,
      mockHotels,
      siteId: 'test-site',
      apiKey: 'test-key',
    });

    // AgodaClient 생성자에서 hotelId를 'mock-' + createSlug(name)으로 재생성하므로
    // createSlug('호텔 그레이서리 신주쿠') 결과와 일치시켜야 함
    const { createSlug } = await import('../src/scripts/generate-hotel-md');
    const expectedId = 'mock-' + createSlug('호텔 그레이서리 신주쿠');

    const detail = await client.getHotelDetail({ hotelId: expectedId });
    expect(detail.name).toBe('호텔 그레이서리 신주쿠');
  });

  test('getHotelDetail throws for unknown hotel in mock mode', async () => {
    const client = new AgodaClient({
      mockMode: true,
      mockHotels,
      siteId: 'test-site',
      apiKey: 'test-key',
    });

    await expect(client.getHotelDetail({ hotelId: '999999' })).rejects.toThrow(
      '호텔 ID 999999 를 찾을 수 없습니다',
    );
  });
});
