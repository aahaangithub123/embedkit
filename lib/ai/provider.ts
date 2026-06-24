import type { ConstraintSet } from "../data/schema";

/**
 * AIProvider — implemented by gemini.ts, groq.ts, ollama.ts
 * Swap providers by changing the import in parseIntent.ts only.
 */
export interface AIProvider {
  extractConstraints(userInput: string): Promise<ConstraintSet>;
}

/**
 * Null provider — used as fallback when AI call fails.
 * Returns all-null ConstraintSet so the solver still runs with manual sliders.
 */
export const nullConstraints: ConstraintSet = {
  powerBudgetMa: null,
  priceUsdCents: null,
  wireless: null,
  batteryType: null,
  useCase: null,
  runtimeMonths: null,
  tags: [],
};
