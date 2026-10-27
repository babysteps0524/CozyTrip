/**
 * Agoda Affiliate Lite API 클라이언트
 *
 * 아고다 제휴 API (Affiliate Lite Search)를 통해 호텔 정보를 수집합니다.
 * 문서: http://affiliateapi7643.agoda.com/affiliateservice/lt_v1
 *
 * PDF(Affiliate_Lite_API_V2.0.pdf, 12p) 기준 주요 동작:
 * - 모든 요청은 POST + JSON 바디 {"criteria": {...}} 로 전송
 * - Authorization 헤더: "siteid:apikey" (서버 전용 시크릿, 브라우저 노출 금지)
 * - 모든 요청에 Accept-Encoding: gzip,deflate 헤더 필요
 * - cityId 또는 hotelId 중 하나는 필수
 * - checkInDate, checkOutDate 필수 (YYYY-MM-DD)
 *
 * 사용 예시:
 *   const client = new AgodaClient();
 *   const hotels = await client.searchHotels({ cityId: 123, limit: 20 });
 */

import type { RawAgodaHotel } from './types.js';
import { createSlug } from './generate-hotel-md.js';

const AGODA_API_BASE_URL =
  import.meta.env.AGODA_API_BASE_URL ??
  'http://affiliateapi7643.agoda.com/affiliateservice/lt_v1';

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

export interface AgodaSearchParams {
  cityId?: number;
  hotelId?: number | number[];
  checkInDate?: string;
  checkOutDate?: string;
  language?: string;
  currency?: string;
  sortBy?: string;
  maxResult?: number;
  discountOnly?: boolean;
  minimumStarRating?: number;
  minimumReviewScore?: number;
  dailyRateMinimum?: number;
  dailyRateMaximum?: number;
  numberOfAdult?: number;
  numberOfChildren?: number;
  childrenAges?: number[];
}

export interface AgodaHotelDetailParams {
  hotelId: number;
}

export class AgodaClient {
  private baseUrl: string;
  private requestIntervalMs: number;
  private lastRequestTime: number = 0;
  private mockMode: boolean;
  private mockHotels: RawAgodaHotel[];
  private siteId: string;
  private apiKey: string;

  constructor(options?: {
    baseUrl?: string;
    requestIntervalMs?: number;
    mockMode?: boolean;
    mockHotels?: MockHotelData[];
    siteId?: string;
    apiKey?: string;
  }) {
    this.baseUrl = options?.baseUrl ?? AGODA_API_BASE_URL;
    this.requestIntervalMs = options?.requestIntervalMs ?? 1000;
    this.mockMode = options?.mockMode ?? false;
    this.mockHotels = (options?.mockHotels ?? []).map((m) => ({
      hotelId: 'mock-' + createSlug(m.name),
      name: m.name,
      city: m.city,
      area: m.area,
      country: '일본',
      summary: m.summary,
      image: m.image,
      images: m.image ? [m.image] : [],
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
    // 서버 전용 인증 정보. 브라우용 번들/공개 환경변수에 포함되지 않아야 함.
    this.siteId = options?.siteId ?? import.meta.env.AGODA_SITE_ID ?? '';
    this.apiKey = options?.apiKey ?? import.meta.env.AGODA_API_KEY ?? '';
  }

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

  private async request<T>(body: unknown): Promise<T> {
    await this.rateLimit();

    if (!this.siteId || !this.apiKey) {
      throw new Error(
        'Agoda API 인증 정보가 설정되지 않았습니다. AGODA_SITE_ID와 AGODA_API_KEY 서버 환경변수를 확인하세요.',
      );
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Accept-Encoding': 'gzip,deflate',
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `${this.siteId}:${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        'Agoda API 요청 실패 (' + response.status + '): ' + errorText,
      );
    }

    return (await response.json()) as T;
  }

  private getDefaultDate(daysFromNow: number): string {
    return new Date(Date.now() + daysFromNow * 86400000)
      .toISOString()
      .split('T')[0];
  }

  private buildAdditional(params: AgodaSearchParams): Record<string, unknown> {
    const additional: Record<string, unknown> = {};

    if (params.language !== undefined) additional.language = params.language;
    if (params.currency !== undefined) additional.currency = params.currency;
    if (params.sortBy !== undefined) additional.sortBy = params.sortBy;
    if (params.maxResult !== undefined) additional.maxResult = params.maxResult;
    if (params.discountOnly !== undefined)
      additional.discountOnly = params.discountOnly;
    if (params.minimumStarRating !== undefined)
      additional.minimumStarRating = params.minimumStarRating;
    if (params.minimumReviewScore !== undefined)
      additional.minimumReviewScore = params.minimumReviewScore;

    if (
      params.dailyRateMinimum !== undefined ||
      params.dailyRateMaximum !== undefined
    ) {
      const rate: Record<string, number> = {};
      if (params.dailyRateMinimum !== undefined)
        rate.minimum = params.dailyRateMinimum;
      if (params.dailyRateMaximum !== undefined)
        rate.maximum = params.dailyRateMaximum;
      additional.dailyRate = rate;
    }

    if (
      params.numberOfAdult !== undefined ||
      params.numberOfChildren !== undefined ||
      params.childrenAges !== undefined
    ) {
      const occupancy: Record<string, unknown> = {};
      if (params.numberOfAdult !== undefined)
        occupancy.numberOfAdult = params.numberOfAdult;
      if (params.numberOfChildren !== undefined)
        occupancy.numberOfChildren = params.numberOfChildren;
      if (params.childrenAges !== undefined)
        occupancy.childrenAges = params.childrenAges;
      additional.occupancy = occupancy;
    }

    return additional;
  }

  async searchHotels(params: AgodaSearchParams): Promise<RawAgodaHotel[]> {
    if (this.mockMode) {
      console.warn('  [모크 모드] ' + this.mockHotels.length + '개 호텔 반환');
      let results = [...this.mockHotels];
      if (params.cityId) {
        results = results.filter((h) => h.city.includes(String(params.cityId)));
      }
      if (params.maxResult) {
        results = results.slice(0, params.maxResult);
      }
      return results;
    }

    if (!params.cityId && !params.hotelId) {
      throw new Error('cityId 또는 hotelId 중 하나는 필수입니다.');
    }

    const checkIn = params.checkInDate ?? this.getDefaultDate(30);
    const checkOut = params.checkOutDate ?? this.getDefaultDate(31);

    const body = {
      criteria: {
        ...(params.cityId !== undefined ? { cityId: params.cityId } : {}),
        ...(params.hotelId !== undefined ? { hotelId: params.hotelId } : {}),
        checkInDate: checkIn,
        checkOutDate: checkOut,
        additional: this.buildAdditional(params),
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await this.request<any>(body);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawHotels: any[] = Array.isArray(response)
      ? response
      : (response?.results ?? response?.data ?? []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawHotels.map((h: any) => {
      return {
        hotelId: h.hotelId ?? h.id,
        name: h.hotelName ?? h.name,
        city: '',
        country: '',
        summary: '',
        image: h.imageURL,
        images: h.imageURL ? [h.imageURL] : [],
        type: h.roomtypeName,
        starRating: h.starRating,
        reviewScore: h.reviewScore,
        reviewCount: h.reviewCount,
        priceMin: h.dailyRate,
        currency: h.currency,
        officialUrl: '',
        affiliateUrl: h.landingURL,
        tags: [],
        amenities: [],
        sources: [],
        facts: [],
        imageRights: 'unknown',
        fetchedAt: new Date().toISOString(),

        // 아고다 Affiliate Lite API 응답 스키마(PDF V2.0) 기준 필드 매핑
        roomtypeName: h.roomtypeName,
        crossedOutRate: h.crossedOutRate,
        discountPercent: h.discountPercentage,
        includeBreakfast: h.includeBreakfast,
        freeWifi: h.freeWifi,
      };
    });
  }

  async getHotelDetail(params: AgodaHotelDetailParams): Promise<RawAgodaHotel> {
    if (this.mockMode) {
      const found = this.mockHotels.find(
        (h) => String(h.hotelId) === String(params.hotelId),
      );
      if (!found) {
        throw new Error('호텔 ID ' + params.hotelId + ' 를 찾을 수 없습니다');
      }
      return { ...found };
    }

    const checkIn = this.getDefaultDate(30);
    const checkOut = this.getDefaultDate(31);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await this.request<any>({
      criteria: {
        hotelId: params.hotelId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        additional: {
          language: 'en-us',
          currency: 'USD',
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hotel: any = Array.isArray(response) ? response[0] : response;

    if (!hotel || !hotel.hotelId) {
      throw new Error('호텔 ID ' + params.hotelId + ' 를 찾을 수 없습니다');
    }

    return {
      hotelId: hotel.hotelId,
      name: hotel.hotelName ?? hotel.name,
      city: '',
      country: '',
      summary: '',
      image: hotel.imageURL,
      images: hotel.imageURL ? [hotel.imageURL] : [],
      type: hotel.roomtypeName,
      starRating: hotel.starRating,
      reviewScore: hotel.reviewScore,
      reviewCount: hotel.reviewCount,
      priceMin: hotel.dailyRate,
      currency: hotel.currency,
      officialUrl: '',
      affiliateUrl: hotel.landingURL,
      tags: [],
      amenities: [],
      sources: [],
      facts: [],
      imageRights: 'unknown',
      fetchedAt: new Date().toISOString(),

      // 아고다 Affiliate Lite API 응답 스키마(PDF V2.0) 기준 필드 매핑
      roomtypeName: hotel.roomtypeName,
      crossedOutRate: hotel.crossedOutRate,
      discountPercent: hotel.discountPercentage,
      includeBreakfast: hotel.includeBreakfast,
      freeWifi: hotel.freeWifi,
    };
  }

  async getHotelDetailsBatch(hotelIds: number[]): Promise<RawAgodaHotel[]> {
    const results: RawAgodaHotel[] = [];
    for (const id of hotelIds) {
      try {
        const detail = await this.getHotelDetail({ hotelId: id });
        results.push(detail);
      } catch (error) {
        console.error('호텔 ID ' + id + ' 상세 조회 실패:', error);
      }
    }
    return results;
  }
}
