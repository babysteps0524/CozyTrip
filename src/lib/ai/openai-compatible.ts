import type { HotelPostGenerationInput } from "../../types";
import { aiConfig } from "./config";
import { buildHotelPostPrompt } from "./prompt";
import { parseHotelPost } from "./parse";
import { AIProviderError, type AIProviderName } from "./types";

interface OpenAICompatibleOptions {
  provider: AIProviderName;
  apiKey: string | undefined;
  endpoint: string;
  model: string;
  input: HotelPostGenerationInput;
}

export async function generateWithOpenAICompatible(
  options: OpenAICompatibleOptions,
) {
  const { provider, apiKey, endpoint, model, input } = options;

  if (!apiKey) {
    throw new AIProviderError(provider, `${provider} API key is not configured.`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), aiConfig.timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.maxOutputTokens,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Return only one valid JSON object matching the requested HotelPost structure.",
          },
          {
            role: "user",
            content: buildHotelPostPrompt(input),
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new AIProviderError(
        provider,
        `${provider} API ${response.status}: ${body.slice(0, 500)}`,
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };

    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw new AIProviderError(provider, `${provider} returned an empty response.`);
    }

    const post = parseHotelPost(text, provider, input.hotel.id);

    return { provider, post };
  } catch (error) {
    if (error instanceof AIProviderError) throw error;
    const message = error instanceof Error ? error.message : "Unknown provider error.";
    throw new AIProviderError(provider, message);
  } finally {
    clearTimeout(timeout);
  }
}
