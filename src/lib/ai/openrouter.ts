import type { HotelPostGenerationInput } from "../../types";
import { aiConfig, isAIProviderConfigured } from "./config";
import { generateWithOpenAICompatible } from "./openai-compatible";
import type { AIProvider } from "./types";

export const openRouterProvider: AIProvider = {
  name: "openrouter",

  isConfigured() {
    return isAIProviderConfigured("openrouter");
  },

  async generate(input: HotelPostGenerationInput) {
    return generateWithOpenAICompatible({
      provider: "openrouter",
      apiKey: aiConfig.openRouterApiKey,
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      model: aiConfig.openRouterModel,
      input,
    });
  },
};
