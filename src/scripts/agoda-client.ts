/**
 * Agoda API 클라이언트
 *
 * 아고다 제휴 API를 통해 호텔 정보를 수집합니다.
 * 환경 변수 AGODA_API_KEY, AGODA_API_SECRET 을 사용합니다.
 *
 * 사용 예시:
 *   const client = new AgodaClient();
 *   const hotels = await client.searchHotels({ keyword: '도쿄', limit: 20 });
 */

import type { RawAgodaHotel } from './types.js';
import { createSlug } from './generate-hotel-md.js';

const AGODA_API_KEY = import.meta.env.AGODA_API_KEY;
const AGODA_API_SECRET = import.meta.env.AGODA_API_SECRET;
const AGODA_API_BASE_URL = import.meta.env.AGODA_API_BASE_URL ?? 'https://api.agoda.com/v1';

if (!AGODA_API_KEY) {
  throw new Error(
    'AGODA_API_KEY 환경 변수가 설정되어 있지 않습니다. .env 파일을 확인하세요.',
  );
}

export interface AgodaSearchParams {
  keyword?: string;
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  limit?: number;
  offset?: number;
}

export interface AgodaHotelDetailParams {
  hotelId: string | number;
}

export interface AgodaApiResponse<T> {
  data?: T;
  results?: T;
  hotels?: T;
  error?: string;
  message?: string;
  status?: string;
  [key: string]: unknown;
}

export interface MockHotelData {
  name: string;
  city: string;
  area?: string;
  summary: string;
  officialUrl?: string;
  affiliateUrl?: string;
  image?: string;
  type?: string;
  starRating?: number;
  reviewScore?: number;
  reviewCount?: number;
  priceMin?: number;
  currency?: string;
  tags?: string[];
}

export class AgodaClient {
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private requestIntervalMs: number;
  private lastRequestTime: number = 0;
  private maxRetries: number = 3;
  private baseRetryDelayMs: number = 2000;
  private mockMode: boolean;
  private mockHotels: RawAgodaHotel[];

  constructor(options?: {
    baseUrl?: string;
    requestIntervalMs?: number;
    maxRetries?: number;
    mockMode?: boolean;
    mockHotels?: MockHotelData[];
  }) {
    this.baseUrl = options?.baseUrl ?? AGODA_API_BASE_URL;
    this.apiKey = AGODA_API_KEY!;
    this.apiSecret = String(AGODA_API_SECRET ?? '');
    this.requestIntervalMs = options?.requestIntervalMs ?? 1000;
    this.maxRetries = options?.maxRetries ?? 3;
    this.mockMode = options?.mockMode ?? false;
    this.mockHotels = (options?.mockHotels ?? []).map((m) => ({
      hotelId: `mock-${createSlug(m.name)}`,
      name: m.name,
      city: m.city,
      area: m.area,
      country: '일본',
      summary: m.summary,
      image: m.image,
      type: m.type,
      starRating: m.starRating,
      reviewScore: m.reviewScore,
      reviewCount: m.reviewCount,
      priceMin: m.priceMin,
      currency: m.currency ?? 'KRW',
      officialUrl: m.officialUrl,
      affiliateUrl: m.affiliateUrl,
      tags: m.tags,
      sources: [],
      facts: [],
      imageRights: 'unknown',
      fetchedAt: new Date().toISOString(),
    }));
  }

  /**
   * API 호출 간 최소 간격을 보장하는 rate limiter
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.requestIntervalMs) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.requestIntervalMs - elapsed),
      );
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * 지수 백오프 재시도 로직이 포함된 API 요청
   */
  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 0,
  ): Promise<T> {
    await this.rateLimit();

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...(this.apiSecret ? { 'X-Agoda-Secret': this.apiSecret } : {}),
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers },
      });
    } catch (err) {
      if (attempt < this.maxRetries) {
        const delay = this.baseRetryDelayMs * Math.pow(2, attempt);
        console.warn(
          `  [재시도 ${attempt + 1}/${this.maxRetries}] ${endpoint} 네트워크 오류, ${delay}ms 후 재시도: ${err}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.requestWithRetry(endpoint, options, attempt + 1);
      }
      throw new Error(`Agoda API 네트워크 오류 (${endpoint}): ${err}`);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');

      // 429 Too Many Requests 또는 5xx 서버 오류는 재시도
      const isRetryable = response.status === 429 || response.status >= 500;

      if (isRetryable && attempt < this.maxRetries) {
        const delay = this.baseRetryDelayMs * Math.pow(2, attempt);
        console.warn(
          `  [재시도 ${attempt + 1}/${this.maxRetries}] ${endpoint} HTTP ${response.status}, ${delay}ms 후 재시도`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.requestWithRetry(endpoint, options, attempt + 1);
      }

      throw new Error(
        `Agoda API 요청 실패 (${response.status}): ${endpoint} ${errorText}`,
      );
    }

    return (await response.json()) as T;
  }

  /**
   * Agoda API 응답에서 호텔 배열을 유연하게 추출
   * 다양한 응답 구조를 지원합니다.
   */
  private extractHotelsFromResponse(response: any): RawAgodaHotel[] {
    if (!response) return [];

    // 가능한 응답 키들을 순서대로 확인
    const possibleKeys = [
      'hotels',
      'data',
      'results',
      'items',
      'properties',
      'searchResults',
    ];

    for (const key of possibleKeys) {
      if (Array.isArray(response[key])) {
        return response[key];
      }
    }

    // 응답 자체가 배열인 경우
    if (Array.isArray(response)) {
      return response;
    }

    // data.hotels 같은 중첩 구조 확인
    if (response.data && Array.isArray(response.data.hotels)) {
      return response.data.hotels;
    }

    if (response.results && Array.isArray(response.results.hotels)) {
      return response.results.hotels;
    }

    return [];
  }

  /**
   * Agoda API 응답에서 단일 호텔을 유연하게 추출
   */
  private extractHotelFromResponse(response: any): RawAgodaHotel | null {
    if (!response) return null;

    const possibleKeys = ['hotel', 'data', 'result', 'property'];

    for (const key of possibleKeys) {
      if (response[key] && typeof response[key] === 'object') {
        return response[key];
      }
    }

    // 응답 자체가 호텔 객체인 경우 (hotelId 등 필드 확인)
    if (response.hotelId || response.id || response.name) {
      return response;
    }

    return null;
  }

  /**
   * 호텔 검색
   */
  async searchHotels(params: AgodaSearchParams = {}): Promise<RawAgodaHotel[]> {
    if (this.mockMode) {
      console.log(`  [모크 모드] ${this.mockHotels.length}개 호텔 반환`);
      let results = [...this.mockHotels];
      if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        results = results.filter(
          (h) =>
            h.name.toLowerCase().includes(kw) ||
            h.city.toLowerCase().includes(kw) ||
            (h.area && h.area.toLowerCase().includes(kw)),
        );
      }
      if (params.city) {
        results = results.filter(
          (h) => h.city.toLowerCase() === params.city!.toLowerCase(),
        );
      }
      if (params.limit) {
        results = results.slice(0, params.limit);
      }
      return results;
    }

    const query = new URLSearchParams();
    if (params.keyword) query.set('keyword', params.keyword);
    if (params.city) query.set('city', params.city);
    if (params.checkIn) query.set('checkIn', params.checkIn);
    if (params.checkOut) query.set('checkOut', params.checkOut);
    if (params.guests) query.set('guests', String(params.guests));
    if (params.rooms) query.set('rooms', String(params.rooms));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.offset) query.set('offset', String(params.offset));

    const endpoint = `/hotels/search?${query.toString()}`;
    const response = await this.requestWithRetry<AgodaApiResponse<any>>(endpoint);

    const hotels = this.extractHotelsFromResponse(response);
    console.log(`  API 응답 파싱: ${hotels.length}개 호텔 추출`);
    return hotels;
  }

  /**
   * 호텔 상세 정보 조회
   */
  async getHotelDetail(params: AgodaHotelDetailParams): Promise<RawAgodaHotel> {
    if (this.mockMode) {
      const hotel = this.mockHotels.find((h) => h.hotelId === params.hotelId);
      if (!hotel) {
        throw new Error(`모크 호텔 ID ${params.hotelId} 를 찾을 수 없습니다`);
      }
      return hotel;
    }

    const endpoint = `/hotels/${params.hotelId}`;
    const response = await this.requestWithRetry<AgodaApiResponse<any>>(endpoint);

    const hotel = this.extractHotelFromResponse(response);
    if (!hotel) {
      throw new Error(`호텔 상세 정보를 파싱할 수 없습니다: ${params.hotelId}`);
    }
    return hotel;
  }

  /**
   * 여러 호텔 상세 정보를 순차적으로 수집 (rate limit 적용)
   */
  async getHotelDetailsBatch(
    hotelIds: (string | number)[],
  ): Promise<RawAgodaHotel[]> {
    const results: RawAgodaHotel[] = [];
    for (const id of hotelIds) {
      try {
        const detail = await this.getHotelDetail({ hotelId: id });
        results.push(detail);
      } catch (error) {
        console.error(`호텔 ID ${id} 상세 조회 실패:`, error);
      }
    }
    return results;
  }
}
