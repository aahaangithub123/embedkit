export const AI_CONFIG = {
  provider: "gemini",
  model: "gemini-2.0-flash-exp",
  endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.AI_API_KEY,
  maxTokens: 500,
  systemPrompt:
    "You are an embedded-systems assistant. Extract hardware constraints from the user's input and respond with VALID JSON ONLY — no markdown, no explanation. " +
    'Schema: { "powerBudgetMa": number | null, "priceUsdCents": number | null, "wireless": string | null, "batteryType": string | null, "useCase": string | null, "runtimeMonths": number | null, "tags": string[] }',
} as const;

// Alternate provider endpoints (swap endpoint + apiKey only):
// Groq        https://api.groq.com/openai/v1
// OpenRouter  https://openrouter.ai/api/v1
// Ollama      http://localhost:11434/v1
