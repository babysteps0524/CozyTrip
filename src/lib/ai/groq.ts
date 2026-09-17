import type { HotelPostGenerationInput } from "../../types";
import { aiConfig, isAIProviderConfigured } from "./config";
import { generateWithOpenAICompatible } from "./openai-compatible";
import type { AIProvider } from "./types";

export const groqProvider: AIProvider = {
  name: "groq",

  isConfigured() {
    return isAIProviderConfigured("groq");
  },

  async generate(input: HotelPostGenerationInput) {
    return generateWithOpenAICompatible({
      provider: "groq",
      apiKey: aiConfig.groqApiKey,
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      model: aiConfig.groqModel,
      input,
    });
  },
};
