import { describe, expect, test } from "bun:test";
import {
  DEFAULT_CHECK_IN_OFFSET_DAYS,
  DEFAULT_STAY_NIGHTS,
  getMyRealTripSearchWindow,
} from "./search-window";

describe("getMyRealTripSearchWindow", () => {
  test("한국 시간 기준 오늘 날짜에서 30일 후를 체크인으로 계산한다", () => {
    const result = getMyRealTripSearchWindow(
      new Date("2026-10-21T00:30:00+09:00"),
    );

    expect(result.source).toBe("rolling");
    expect(result.checkIn).toBe("2026-11-20");
    expect(result.checkOut).toBe("2026-11-23");
  });

  test("한국 자정 직전에도 한국 날짜를 기준으로 계산한다", () => {
    const result = getMyRealTripSearchWindow(
      new Date("2026-10-21T23:59:59+09:00"),
    );

    expect(result.checkIn).toBe("2026-11-20");
    expect(result.checkOut).toBe("2026-11-23");
  });

  test("환경변수가 있으면 자동 날짜보다 환경변수를 우선한다", () => {
    const previousCheckIn = process.env.MYREALTRIP_CHECK_IN;
    const previousCheckOut = process.env.MYREALTRIP_CHECK_OUT;

    process.env.MYREALTRIP_CHECK_IN = "2026-12-01";
    process.env.MYREALTRIP_CHECK_OUT = "2026-12-04";

    try {
      const result = getMyRealTripSearchWindow(
        new Date("2026-10-21T12:00:00+09:00"),
      );

      expect(result.source).toBe("environment");
      expect(result.checkIn).toBe("2026-12-01");
      expect(result.checkOut).toBe("2026-12-04");
    } finally {
      if (previousCheckIn === undefined) {
        delete process.env.MYREALTRIP_CHECK_IN;
      } else {
        process.env.MYREALTRIP_CHECK_IN = previousCheckIn;
      }

      if (previousCheckOut === undefined) {
        delete process.env.MYREALTRIP_CHECK_OUT;
      } else {
        process.env.MYREALTRIP_CHECK_OUT = previousCheckOut;
      }
    }
  });

  test("기본 조회 기간은 3박이다", () => {
    const result = getMyRealTripSearchWindow(
      new Date("2026-10-21T12:00:00+09:00"),
    );

    expect(result.checkIn).toBe("2026-11-20");
    expect(result.checkOut).toBe("2026-11-23");
    expect(DEFAULT_CHECK_IN_OFFSET_DAYS).toBe(30);
    expect(DEFAULT_STAY_NIGHTS).toBe(3);
  });
});
