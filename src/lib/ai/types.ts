import type { HotelPost, HotelPostGenerationInput } from "../../types";

export type AIProviderName = "gemini" | "groq" | "openrouter";

export interface AIProviderResult {
  provider: AIProviderName;
  post: HotelPost;
}

export interface AIProvider {
  name: AIProviderName;
  isConfigured(): boolean;
  generate(input: HotelPostGenerationInput): Promise<AIProviderResult>;
}

export interface AIRequestOptions {
  temperature?: number;
  maxOutputTokens?: number;
}

export class AIProviderError extends Error {
  readonly provider: AIProviderName;

  constructor(provider: AIProviderName, message: string) {
    super(message);
    this.name = "AIProviderError";
    this.provider = provider;
  }
}
