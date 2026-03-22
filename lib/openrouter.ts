import OpenAI from "openai";

export function getOpenRouterClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY n'est pas configurée");
  }

  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Studio IA",
    },
  });
}

export const DEFAULT_MODEL = "anthropic/claude-3.5-sonnet";

export const AVAILABLE_MODELS = [
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet (Anthropic)" },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku (Anthropic)" },
  { id: "openai/gpt-4o", name: "GPT-4o (OpenAI)" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini (OpenAI)" },
  { id: "google/gemini-flash-1.5", name: "Gemini Flash 1.5 (Google)" },
  { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B (Meta)" },
  { id: "mistralai/mistral-large", name: "Mistral Large" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek Chat" },
] as const;
