const DAY_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_CHECK_IN_OFFSET_DAYS = 30;
export const DEFAULT_STAY_NIGHTS = 3;
export const MYREALTRIP_TIME_ZONE = "Asia/Seoul";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseDate(value: string, name: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${name} must use YYYY-MM-DD.`);
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime()) || formatDate(date) !== value) {
    throw new Error(`${name} must be a valid date.`);
  }

  return date;
}

function getCurrentDateInTimeZone(
  timeZone: string,
  now: Date = new Date(),
): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    calendar: "gregory",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return parseDate(
    `${values.year}-${values.month}-${values.day}`,
    `${timeZone} current date`,
  );
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export interface MyRealTripSearchWindow {
  checkIn: string;
  checkOut: string;
  source: "environment" | "rolling";
}

export function getMyRealTripSearchWindow(
  now: Date = new Date(),
): MyRealTripSearchWindow {
  const configuredCheckIn = process.env.MYREALTRIP_CHECK_IN?.trim();
  const configuredCheckOut = process.env.MYREALTRIP_CHECK_OUT?.trim();

  if (configuredCheckIn || configuredCheckOut) {
    if (!configuredCheckIn || !configuredCheckOut) {
      throw new Error(
        "MYREALTRIP_CHECK_IN and MYREALTRIP_CHECK_OUT must be provided together.",
      );
    }

    const checkIn = parseDate(configuredCheckIn, "MYREALTRIP_CHECK_IN");
    const checkOut = parseDate(configuredCheckOut, "MYREALTRIP_CHECK_OUT");

    if (checkIn >= checkOut) {
      throw new Error(
        "MYREALTRIP_CHECK_OUT must be later than MYREALTRIP_CHECK_IN.",
      );
    }

    return {
      checkIn: configuredCheckIn,
      checkOut: configuredCheckOut,
      source: "environment",
    };
  }

  const today = getCurrentDateInTimeZone(MYREALTRIP_TIME_ZONE, now);
  const checkIn = addDays(today, DEFAULT_CHECK_IN_OFFSET_DAYS);
  const checkOut = addDays(checkIn, DEFAULT_STAY_NIGHTS);

  return {
    checkIn: formatDate(checkIn),
    checkOut: formatDate(checkOut),
    source: "rolling",
  };
}
