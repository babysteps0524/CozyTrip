import type { HotelPostGenerationInput } from "../../types";
import { aiConfig, isAIProviderConfigured } from "./config";
import { buildHotelPostPrompt } from "./prompt";
import { parseHotelPost } from "./parse";
import { AIProviderError, type AIProvider } from "./types";

export const geminiProvider: AIProvider = {
  name: "gemini",

  isConfigured() {
    return isAIProviderConfigured("gemini");
  },

  async generate(input: HotelPostGenerationInput) {
    const apiKey = aiConfig.geminiApiKey;

    if (!apiKey) {
      throw new AIProviderError("gemini", "GEMINI_API_KEY is not configured.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), aiConfig.timeoutMs);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(aiConfig.geminiModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: buildHotelPostPrompt(input) }],
            },
          ],
          generationConfig: {
            temperature: aiConfig.temperature,
            maxOutputTokens: aiConfig.maxOutputTokens,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new AIProviderError(
          "gemini",
          `Gemini API ${response.status}: ${body.slice(0, 500)}`,
        );
      }

      const data = (await response.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };

      const text = data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("")
        .trim();

      if (!text) {
        throw new AIProviderError("gemini", "Gemini returned an empty response.");
      }

      const post = parseHotelPost(text, "gemini", input.hotel.id);

      return { provider: "gemini" as const, post };
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      const message = error instanceof Error ? error.message : "Unknown Gemini error.";
      throw new AIProviderError("gemini", message);
    } finally {
      clearTimeout(timeout);
    }
  },
};
