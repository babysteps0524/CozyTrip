import type { HotelPost, HotelPostGenerationInput } from "../../types";
import { geminiProvider } from "./gemini";
import { groqProvider } from "./groq";
import { openRouterProvider } from "./openrouter";
import type { AIProvider, AIProviderName } from "./types";

const providers: AIProvider[] = [
  geminiProvider,
  groqProvider,
  openRouterProvider,
];

export interface HotelPostGenerationResult {
  post: HotelPost;
  provider: AIProviderName;
  attemptedProviders: AIProviderName[];
}

export class AllAIProvidersFailedError extends Error {
  readonly errors: Array<{
    provider: AIProviderName;
    message: string;
  }>;

  constructor(
    errors: Array<{ provider: AIProviderName; message: string }>,
  ) {
    super("All configured AI providers failed to generate the hotel post.");
    this.name = "AllAIProvidersFailedError";
    this.errors = errors;
  }
}

export async function generateHotelPost(
  input: HotelPostGenerationInput,
): Promise<HotelPostGenerationResult> {
  const attemptedProviders: AIProviderName[] = [];
  const errors: Array<{ provider: AIProviderName; message: string }> = [];

  for (const provider of providers) {
    if (!provider.isConfigured()) {
      continue;
    }

    attemptedProviders.push(provider.name);

    try {
      const result = await provider.generate(input);

      return {
        post: result.post,
        provider: result.provider,
        attemptedProviders,
      };
    } catch (error) {
      errors.push({
        provider: provider.name,
        message: error instanceof Error ? error.message : "Unknown error.",
      });
    }
  }

  throw new AllAIProvidersFailedError(errors);
}

export function getConfiguredAIProviders(): AIProviderName[] {
  return providers
    .filter((provider) => provider.isConfigured())
    .map((provider) => provider.name);
}
