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

export class AgodaClient {
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private requestIntervalMs: number;
  private lastRequestTime: number = 0;

  constructor(options?: {
    baseUrl?: string;
    requestIntervalMs?: number;
  }) {
    this.baseUrl = options?.baseUrl ?? AGODA_API_BASE_URL;
    this.apiKey = AGODA_API_KEY!;
    this.apiSecret = String(AGODA_API_SECRET ?? '');
    this.requestIntervalMs = options?.requestIntervalMs ?? 1000;
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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    await this.rateLimit();

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...(this.apiSecret ? { 'X-Agoda-Secret': this.apiSecret } : {}),
    };

    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Agoda API 요청 실패 (${response.status}): ${endpoint} ${errorText}`,
      );
    }

    return (await response.json()) as T;
  }

  /**
   * 호텔 검색
   */
  async searchHotels(params: AgodaSearchParams = {}): Promise<RawAgodaHotel[]> {
    const query = new URLSearchParams();
    if (params.keyword) query.set('keyword', params.keyword);
    if (params.city) query.set('city', params.city);
    if (params.checkIn) query.set('checkIn', params.checkIn);
    if (params.checkOut) query.set('checkOut', params.checkOut);
    if (params.guests) query.set('guests', String(params.guests));
    if (params.rooms) query.set('rooms', String(params.rooms));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.offset) query.set('offset', String(params.offset));

    const data = await this.request<{ hotels: RawAgodaHotel[] }>(
      `/hotels/search?${query.toString()}`,
    );
    return data.hotels ?? [];
  }

  /**
   * 호텔 상세 정보 조회
   */
  async getHotelDetail(params: AgodaHotelDetailParams): Promise<RawAgodaHotel> {
    return this.request<RawAgodaHotel>(`/hotels/${params.hotelId}`);
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
