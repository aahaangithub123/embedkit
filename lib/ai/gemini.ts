import { AI_CONFIG } from "../../config/ai.config";
import type { AIProvider } from "./provider";
import type { ConstraintSet } from "../data/schema";
import { nullConstraints } from "./provider";

export class GeminiProvider implements AIProvider {
  async extractConstraints(userInput: string): Promise<ConstraintSet> {
    const response = await fetch(`${AI_CONFIG.endpoint}chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        max_tokens: AI_CONFIG.maxTokens,
        messages: [
          { role: "system", content: AI_CONFIG.systemPrompt },
          { role: "user", content: userInput },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";

    try {
      // Strip markdown fences if model adds them despite instructions
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean) as ConstraintSet;
      return parsed;
    } catch {
      console.error("[GeminiProvider] JSON parse failed. Raw:", raw);
      return nullConstraints;
    }
  }
}
