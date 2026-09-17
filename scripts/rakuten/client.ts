export interface RakutenApiRequest {
  endpoint: string;
  params: Record<string, string>;
}

export async function fetchRakutenApi(
  request: RakutenApiRequest,
): Promise<unknown> {
  const url = new URL(request.endpoint);

  for (const [key, value] of Object.entries(request.params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Rakuten API request failed: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Rakuten API returned an unexpected content type: ${contentType}`,
    );
  }

  return response.json();
}
