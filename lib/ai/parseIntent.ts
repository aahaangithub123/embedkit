import { AI_CONFIG } from "../../config/ai.config";
import { GeminiProvider } from "./gemini";
import type { ConstraintSet } from "../data/schema";
import { nullConstraints } from "./provider";

function getProvider() {
  switch (AI_CONFIG.provider) {
    case "gemini":
      return new GeminiProvider();
    default:
      console.warn(`[parseIntent] Unknown provider "${AI_CONFIG.provider}". Using null fallback.`);
      return null;
  }
}

/**
 * parseIntent — call this from the API route.
 * Never call from client components.
 * Returns nullConstraints on any failure so the app remains functional.
 */
export async function parseIntent(userInput: string): Promise<ConstraintSet> {
  const trimmed = userInput.trim();
  if (!trimmed) return nullConstraints;

  const provider = getProvider();
  if (!provider) return nullConstraints;

  try {
    return await provider.extractConstraints(trimmed);
  } catch (err) {
    console.error("[parseIntent] Provider error:", err);
    return nullConstraints;
  }
}
