import type { AIProviderName } from "./types";

function getEnv(name: string): string | undefined {
  const value = process.env[name];
  return value?.trim() || undefined;
}

export interface AIConfig {
  geminiApiKey?: string;
  geminiModel: string;
  groqApiKey?: string;
  groqModel: string;
  openRouterApiKey?: string;
  openRouterModel: string;
  timeoutMs: number;
  temperature: number;
  maxOutputTokens: number;
}

export const aiConfig: AIConfig = {
  geminiApiKey: getEnv("GEMINI_API_KEY"),
  geminiModel: getEnv("GEMINI_MODEL") ?? "gemini-2.5-flash",
  groqApiKey: getEnv("GROQ_API_KEY"),
  groqModel: getEnv("GROQ_MODEL") ?? "llama-3.3-70b-versatile",
  openRouterApiKey: getEnv("OPENROUTER_API_KEY"),
  openRouterModel:
    getEnv("OPENROUTER_MODEL") ?? "openai/gpt-4o-mini",
  timeoutMs: Number(getEnv("AI_TIMEOUT_MS") ?? "30000"),
  temperature: Number(getEnv("AI_TEMPERATURE") ?? "0.4"),
  maxOutputTokens: Number(getEnv("AI_MAX_OUTPUT_TOKENS") ?? "4000"),
};

export function isAIProviderConfigured(
  provider: AIProviderName,
): boolean {
  switch (provider) {
    case "gemini":
      return Boolean(aiConfig.geminiApiKey);
    case "groq":
      return Boolean(aiConfig.groqApiKey);
    case "openrouter":
      return Boolean(aiConfig.openRouterApiKey);
  }
}
