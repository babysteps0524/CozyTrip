/**
 * Agoda Affiliate Lite API 클라이언트
 *
 * 아고다 제휴 API (Affiliate Lite Search)를 통해 호텔 정보를 수집합니다.
 * 문서: http://affiliateapi7643.agoda.com/affiliateservice/lt_v1
 *
 * 참고:
 * - HTTPS 사용 시 계정 관리자에게 문의 필요 (현재는 HTTP 엔드포인트 사용)
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

const AGODA_API_BASE_URL = import.meta.env.AGODA_API_BASE_URL ?? 'http://affiliateapi7643.agoda.com/affiliateservice/lt_v1';

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

  constructor(options?: {
    baseUrl?: string;
    requestIntervalMs?: number;
    mockMode?: boolean;
    mockHotels?: MockHotelData[];
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
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.requestIntervalMs) {
      await new Promise((resolve) => setTimeout(resolve, this.requestIntervalMs - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  private async request<T>(params: Record<string, string | number | boolean>): Promise<T> {
    await this.rateLimit();

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }

    const url = this.baseUrl + '?' + searchParams.toString();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept-Encoding': 'gzip,deflate',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error('Agoda API 요청 실패 (' + response.status + '): ' + errorText);
    }

    return (await response.json()) as T;
  }

  private getDefaultDate(daysFromNow: number): string {
    return new Date(Date.now() + daysFromNow * 86400000).toISOString().split('T')[0];
  }

  async searchHotels(params: AgodaSearchParams): Promise<RawAgodaHotel[]> {
    if (this.mockMode) {
      console.log('  [모크 모드] ' + this.mockHotels.length + '개 호텔 반환');
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

    const queryParams: Record<string, string | number | boolean> = {};

    if (params.cityId !== undefined) {
      queryParams.cityId = params.cityId;
    }
    if (params.hotelId !== undefined) {
      if (Array.isArray(params.hotelId)) {
        queryParams.hotelId = params.hotelId.join(',');
      } else {
        queryParams.hotelId = params.hotelId;
      }
    }
    queryParams.checkInDate = checkIn;
    queryParams.checkOutDate = checkOut;
    queryParams.language = params.language ?? 'en-us';
    queryParams.currency = params.currency ?? 'USD';
    queryParams.sortBy = params.sortBy ?? 'Recommended';
    if (params.maxResult !== undefined) {
      queryParams.maxResult = params.maxResult;
    }
    if (params.discountOnly !== undefined) {
      queryParams.discountOnly = params.discountOnly;
    }
    if (params.minimumStarRating !== undefined) {
      queryParams.minimumStarRating = params.minimumStarRating;
    }
    if (params.minimumReviewScore !== undefined) {
      queryParams.minimumReviewScore = params.minimumReviewScore;
    }
    if (params.dailyRateMinimum !== undefined) {
      queryParams['dailyRate.minimum'] = params.dailyRateMinimum;
    }
    if (params.dailyRateMaximum !== undefined) {
      queryParams['dailyRate.maximum'] = params.dailyRateMaximum;
    }
    if (params.numberOfAdult !== undefined) {
      queryParams['occupancy.numberOfAdult'] = params.numberOfAdult;
    }
    if (params.numberOfChildren !== undefined) {
      queryParams['occupancy.numberOfChildren'] = params.numberOfChildren;
    }
    if (params.childrenAges !== undefined) {
      queryParams['occupancy.childrenAges'] = params.childrenAges.join(',');
    }

    const response = await this.request<any>(queryParams);

    const rawHotels: any[] = Array.isArray(response)
      ? response
      : (response?.hotels ?? response?.results ?? response?.data ?? []);

    return rawHotels.map((h: any) => {
      return {
        hotelId: h.hotelId ?? h.id,
        name: h.hotelName ?? h.name,
        city: '',
        country: '',
        summary: '',
        image: h.imageURL,
        images: h.imageURL ? [h.imageURL] : [],
        type: '',
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
      };
    });
  }

  async getHotelDetail(params: AgodaHotelDetailParams): Promise<RawAgodaHotel> {
    const checkIn = this.getDefaultDate(30);
    const checkOut = this.getDefaultDate(31);

    const response = await this.request<any>({
      hotelId: params.hotelId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      language: 'en-us',
      currency: 'USD',
    });

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
      type: '',
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
