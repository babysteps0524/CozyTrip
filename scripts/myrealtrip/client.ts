import { getMyRealTripConfig } from "./config";

export interface MyRealTripRequestInit {
  method?: "GET" | "POST";
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

export async function fetchMyRealTrip<T>(
  path: string,
  request: MyRealTripRequestInit = {},
): Promise<T> {
  const config = getMyRealTripConfig();

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${config.baseUrl}${normalizedPath}`);

  for (const [key, value] of Object.entries(request.query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    method: request.method ?? "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      ...(request.body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
    },
    ...(request.body !== undefined
      ? { body: JSON.stringify(request.body) }
      : {}),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");

    throw new Error(
      [
        "MyRealTrip Partner API request failed.",
        `Status: ${response.status} ${response.statusText}`,
        body ? `Response: ${body.slice(0, 500)}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error(
      `MyRealTrip Partner API returned an unexpected content type: ${contentType}`,
    );
  }

  return response.json() as Promise<T>;
}
