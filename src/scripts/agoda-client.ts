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

import { z } from 'zod';
import type { RawAgodaHotel } from './types.js';
import { createSlug } from './generate-hotel-md.js';

const AGODA_API_BASE_URL =
  import.meta.env.AGODA_API_BASE_URL ??
  'http://affiliateapi7643.agoda.com/affiliateservice/lt_v1';

/** 기본 요청 타임아웃 (밀리초) */
const DEFAULT_REQUEST_TIMEOUT_MS = 5000;

/** 최대 재시도 횟수 */
const MAX_RETRIES = 3;

/** 재시도 간격 기준 (밀리초) */
const RETRY_BASE_DELAY_MS = 1000;

/** 연속 실패 임계값 (회로 차단기) */
const CIRCUIT_BREAKER_THRESHOLD = 5;

/** 회로 차단기 복구 대기 시간 (밀리초) */
const CIRCUIT_BREAKER_RESET_MS = 60000;

/** 아고다 API 에러 응답 스키마 */
const AgodaErrorSchema = z.object({
  error: z.object({
    id: z.number(),
    message: z.string(),
  }),
});

/** 아고다 API 단일 호텔 응답 스키마 (PDF V2.0 기준) */
const AgodaHotelSchema = z.object({
  hotelId: z.number(),
  hotelName: z.string(),
  roomtypeName: z.string().optional(),
  starRating: z.number().min(0).max(5).optional(),
  reviewScore: z.number().min(0).max(10).optional(),
  reviewCount: z.number().min(0).optional(),
  currency: z.string(),
  dailyRate: z.number().min(0).optional(),
  crossedOutRate: z.number().min(0).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  imageURL: z.string().url().optional(),
  landingURL: z.string().url().optional(),
  includeBreakfast: z.boolean().optional(),
  freeWifi: z.boolean().optional(),
});

/** 아고다 API 검색 응답 스키마 */
const AgodaSearchResponseSchema = z.object({
  results: z.array(AgodaHotelSchema),
});

/** 아고다 API 단일 호텔 응답 타입 */
type AgodaHotelResult = z.infer<typeof AgodaHotelSchema>;

/** Agoda 클라이언트 커스텀 에러 클래스 */
export class AgodaClientError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly retryable: boolean;

  constructor(message: string, options?: { code?: string; statusCode?: number; retryable?: boolean }) {
    super(message);
    this.name = 'AgodaClientError';
    this.code = options?.code ?? 'UNKNOWN';
    this.statusCode = options?.statusCode;
    this.retryable = options?.retryable ?? false;
  }
}

/** 인증 오류 (401/403) */
export class AgodaAuthError extends AgodaClientError {
  constructor(message: string, statusCode?: number) {
    super(message, { code: 'AUTH_ERROR', statusCode, retryable: false });
    this.name = 'AgodaAuthError';
  }
}

/** 속도 제한 오류 (429) */
export class AgodaRateLimitError extends AgodaClientError {
  constructor(message: string, retryAfter?: number) {
    super(message, { code: 'RATE_LIMIT', statusCode: 429, retryable: true });
    this.name = 'AgodaRateLimitError';
    this.retryAfter = retryAfter;
  }

  public readonly retryAfter?: number;
}

/** 서버 오류 (5xx) */
export class AgodaServerError extends AgodaClientError {
  constructor(message: string, statusCode: number) {
    super(message, { code: 'SERVER_ERROR', statusCode, retryable: true });
    this.name = 'AgodaServerError';
  }
}

/** 네트워크 오류 */
export class AgodaNetworkError extends AgodaClientError {
  constructor(message: string) {
    super(message, { code: 'NETWORK_ERROR', retryable: true });
    this.name = 'AgodaNetworkError';
  }
}

/** 응답 파싱 오류 */
export class AgodaParseError extends AgodaClientError {
  constructor(message: string) {
    super(message, { code: 'PARSE_ERROR', retryable: false });
    this.name = 'AgodaParseError';
  }
}

/** 아고다 API 검색 파라미터 */
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

/** 아고다 API 호텔 상세 파라미터 */
export interface AgodaHotelDetailParams {
  hotelId: number;
}

/** 모크 호텔 데이터 */
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

/** 회로 차단기 상태 */
type CircuitBreakerState = 'closed' | 'open' | 'half-open';

/**
 * HTTP 상태 코드가 재시도 대상인지 판단합니다.
 * 429(속도 제한), 5xx(서버 오류)는 재시도 대상, 401/403(인증)은 재시도 대상이 아님.
 */
function isRetryableStatus(status: number): boolean {
  if (status === 429) return true;
  if (status >= 500 && status < 600) return true;
  return false;
}

/**
 * 지수 백오프 대기 시간을 계산합니다.
 * attempt: 0부터 시작하는 재시도 횟수
 */
function calculateBackoffMs(attempt: number): number {
  return RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
}

export class AgodaClient {
  private baseUrl: string;
  private requestIntervalMs: number;
  private lastRequestTime: number = 0;
  private mockMode: boolean;
  private mockHotels: RawAgodaHotel[];
  private siteId: string;
  private apiKey: string;
  private requestTimeoutMs: number;

  // 회로 차단기 상태
  private circuitState: CircuitBreakerState = 'closed';
  private consecutiveFailures: number = 0;
  private circuitOpenedAt: number = 0;

  constructor(options?: {
    baseUrl?: string;
    requestIntervalMs?: number;
    mockMode?: boolean;
    mockHotels?: MockHotelData[];
    siteId?: string;
    apiKey?: string;
    requestTimeoutMs?: number;
  }) {
    this.baseUrl = options?.baseUrl ?? AGODA_API_BASE_URL;
    this.requestIntervalMs = options?.requestIntervalMs ?? 1000;
    this.mockMode = options?.mockMode ?? false;
    this.requestTimeoutMs = options?.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
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
    // 서버 전용 인증 정보. 브라우저 번들/공개 환경변수에 포함되지 않아야 함.
    this.siteId = options?.siteId ?? import.meta.env.AGODA_SITE_ID ?? '';
    this.apiKey = options?.apiKey ?? import.meta.env.AGODA_API_KEY ?? '';
  }

  /** 회로 차단기가 열려 있는지 확인하고, 복구 시간이 지났으면 half-open 상태로 전환 */
  private checkCircuitBreaker(): void {
    const now = Date.now();

    if (this.circuitState === 'open') {
      if (now - this.circuitOpenedAt >= CIRCUIT_BREAKER_RESET_MS) {
        this.circuitState = 'half-open';
        this.consecutiveFailures = 0;
      } else {
        throw new AgodaClientError(
          'Agoda API 회로 차단기가 열려 있습니다. 잠시 후 다시 시도하세요.',
          { code: 'CIRCUIT_OPEN', retryable: false },
        );
      }
    }
  }

  /** 요청 성공 시 회로 차단기 상태 업데이트 */
  private onCircuitSuccess(): void {
    this.consecutiveFailures = 0;
    this.circuitState = 'closed';
  }

  /** 요청 실패 시 회로 차단기 상태 업데이트 */
  private onCircuitFailure(): void {
    this.consecutiveFailures++;
    if (this.consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
      this.circuitState = 'open';
      this.circuitOpenedAt = Date.now();
    }
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

  /**
   * 아고다 API 요청을 전송합니다.
   * 재시도 로직, 타임아웃, 회로 차단기를 적용합니다.
   * 인증 정보(사이트 ID, API 키)는 절대 로그에 출력하지 않습니다.
   */
  private async request(body: unknown): Promise<unknown> {
    this.checkCircuitBreaker();
    await this.rateLimit();

    if (!this.siteId || !this.apiKey) {
      this.onCircuitFailure();
      throw new AgodaClientError(
        'Agoda API 인증 정보가 설정되지 않았습니다. AGODA_SITE_ID와 AGODA_API_KEY 서버 환경변수를 확인하세요.',
        { code: 'MISSING_AUTH', retryable: false },
      );
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      // 회로 차단기 확인 (재시도 간에도 상태 변경 가능)
      if (attempt > 0) {
        this.checkCircuitBreaker();
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Accept-Encoding': 'gzip,deflate',
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `${this.siteId}:${this.apiKey}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // 성공 응답
        if (response.ok) {
          const text = await response.text();
          if (!text || text.trim().length === 0) {
            this.onCircuitSuccess();
            throw new AgodaParseError('Agoda API 응답이 비어 있습니다.');
          }

          let parsed: unknown;
          try {
            parsed = JSON.parse(text);
          } catch {
            this.onCircuitFailure();
            throw new AgodaParseError('Agoda API 응답이 유효한 JSON이 아닙니다.');
          }

          this.onCircuitSuccess();
          return parsed;
        }

        // 오류 응답
        const errorText = await response.text().catch(() => '');

        // 인증 오류는 재시도하지 않음
        if (response.status === 401 || response.status === 403) {
          this.onCircuitFailure();
          throw new AgodaAuthError(
            `Agoda API 인증 실패 (${response.status}). API 키와 사이트 ID를 확인하세요.`,
            response.status,
          );
        }

        // 속도 제한 오류
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after');
          lastError = new AgodaRateLimitError(
            `Agoda API 속도 제한 (${response.status}).`,
            retryAfter ? parseInt(retryAfter, 10) : undefined,
          );
        } else if (isRetryableStatus(response.status)) {
          lastError = new AgodaServerError(
            `Agoda API 서버 오류 (${response.status}).`,
            response.status,
          );
        } else {
          // 4xx 등 기타 클라이언트 오류는 재시도하지 않음
          this.onCircuitFailure();
          throw new AgodaClientError(
            `Agoda API 요청 실패 (${response.status}): ${errorText}`,
            { code: 'REQUEST_ERROR', statusCode: response.status, retryable: false },
          );
        }
      } catch (error) {
        clearTimeout(timeoutId);

        // 이미 AgodaClientError 인스턴스는 그대로 전파
        if (error instanceof AgodaClientError) {
          if (!error.retryable) {
            this.onCircuitFailure();
            throw error;
          }
          lastError = error;
        } else if (error instanceof DOMException && error.name === 'AbortError') {
          lastError = new AgodaNetworkError(
            `Agoda API 요청 타임아웃 (${this.requestTimeoutMs}ms 초과).`,
          );
        } else if (error instanceof TypeError && error.message.includes('fetch')) {
          lastError = new AgodaNetworkError(
            'Agoda API 네트워크 연결에 실패했습니다.',
          );
        } else {
          lastError = error instanceof Error ? error : new Error(String(error));
        }

        // 마지막 시도면 에러 발생
        if (attempt === MAX_RETRIES) {
          this.onCircuitFailure();
          throw lastError;
        }

        // 재시도 전 대기 (지수 백오프)
        const backoffMs = calculateBackoffMs(attempt);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    this.onCircuitFailure();
    throw lastError ?? new AgodaClientError('Agoda API 요청에 실패했습니다.', { retryable: false });
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
      throw new AgodaClientError(
        'cityId 또는 hotelId 중 하나는 필수입니다.',
        { code: 'MISSING_CRITERIA', retryable: false },
      );
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

    const response = await this.request(body);

    const parsed = AgodaSearchResponseSchema.safeParse(response);
    if (!parsed.success) {
      const errorResponse = AgodaErrorSchema.safeParse(response);
      if (errorResponse.success) {
        throw new AgodaClientError(
          `Agoda API 오류 (${errorResponse.data.error.id}): ${errorResponse.data.error.message}`,
          { code: 'API_ERROR', statusCode: errorResponse.data.error.id, retryable: false },
        );
      }
      throw new AgodaParseError(
        'Agoda API 응답 형식이 올바르지 않습니다: ' +
          parsed.error.issues.map((i) => i.message).join(', '),
      );
    }

    return parsed.data.results.map((h: AgodaHotelResult) => {
      return {
        hotelId: String(h.hotelId),
        name: h.hotelName,
        city: '',
        country: '',
        summary: '',
        image: h.imageURL ?? undefined,
        images: h.imageURL ? [h.imageURL] : [],
        type: h.roomtypeName ?? undefined,
        starRating: h.starRating,
        reviewScore: h.reviewScore,
        reviewCount: h.reviewCount,
        priceMin: h.dailyRate,
        currency: h.currency,
        officialUrl: '',
        affiliateUrl: h.landingURL ?? undefined,
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
        throw new AgodaClientError(
          '호텔 ID ' + params.hotelId + ' 를 찾을 수 없습니다.',
          { code: 'HOTEL_NOT_FOUND', retryable: false },
        );
      }
      return { ...found };
    }

    const checkIn = this.getDefaultDate(30);
    const checkOut = this.getDefaultDate(31);

    const response = await this.request({
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

    const parsed = AgodaHotelSchema.safeParse(response);
    if (!parsed.success) {
      const errorResponse = AgodaErrorSchema.safeParse(response);
      if (errorResponse.success) {
        throw new AgodaClientError(
          `Agoda API 오류 (${errorResponse.data.error.id}): ${errorResponse.data.error.message}`,
          { code: 'API_ERROR', statusCode: errorResponse.data.error.id, retryable: false },
        );
      }
      throw new AgodaParseError(
        'Agoda API 응답 형식이 올바르지 않습니다: ' +
          parsed.error.issues.map((i) => i.message).join(', '),
      );
    }

    const hotel = parsed.data;

    if (!hotel || !hotel.hotelId) {
      throw new AgodaClientError(
        '호텔 ID ' + params.hotelId + ' 를 찾을 수 없습니다.',
        { code: 'HOTEL_NOT_FOUND', retryable: false },
      );
    }

    return {
      hotelId: String(hotel.hotelId),
      name: hotel.hotelName,
      city: '',
      country: '',
      summary: '',
      image: hotel.imageURL ?? undefined,
      images: hotel.imageURL ? [hotel.imageURL] : [],
      type: hotel.roomtypeName ?? undefined,
      starRating: hotel.starRating,
      reviewScore: hotel.reviewScore,
      reviewCount: hotel.reviewCount,
      priceMin: hotel.dailyRate,
      currency: hotel.currency,
      officialUrl: '',
      affiliateUrl: hotel.landingURL ?? undefined,
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
        // 개별 호텔 조회 실패는 전체 파이프라인을 중단시키지 않음
        console.error('호텔 ID ' + id + ' 상세 조회 실패:', error instanceof Error ? error.message : String(error));
      }
    }
    return results;
  }

  /** 회로 차단기 상태 조회 (모니터링/디버깅용, 민감 정보 미포함) */
  getCircuitState(): {
    state: CircuitBreakerState;
    consecutiveFailures: number;
    openedAt?: number;
  } {
    return {
      state: this.circuitState,
      consecutiveFailures: this.consecutiveFailures,
      openedAt: this.circuitState === 'open' ? this.circuitOpenedAt : undefined,
    };
  }
}
