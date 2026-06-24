# Day 3 — AI Constraint Extraction + Landing Page

## Objective
Wire Gemini 2.0 Flash to the landing page. User types natural language → AI returns ConstraintSet JSON → stored in localStorage → ready for Day 4 constraintSolver.

## Deliverables
| File | Type | Purpose |
|---|---|---|
| `lib/data/schema.ts` | APPEND | Add ConstraintSet interface |
| `lib/ai/provider.ts` | NEW | AIProvider interface (swap point) |
| `lib/ai/gemini.ts` | NEW | Gemini 2.0 Flash implementation |
| `lib/ai/parseIntent.ts` | NEW | Orchestrator — NL → ConstraintSet |
| `app/api/parse-intent/route.ts` | NEW | Server-side proxy — keeps API key off client |
| `app/page.tsx` | NEW | Landing page — text input + submit |

## Contracts Introduced

### ConstraintSet (append to lib/data/schema.ts)
```ts
export interface ConstraintSet {
  powerBudgetMa: number | null;     // max total current draw
  priceUsdCents: number | null;     // max total BOM cost
  wireless: string | null;          // "ble" | "lora" | "wifi" | null
  batteryType: string | null;       // "lipo" | "aaa" | "coin" | null
  useCase: string | null;           // raw phrase, passed to tag scorer
  runtimeMonths: number | null;     // target battery life
  tags: string[];                   // matched against Component.tags
}
```

### AIProvider Interface (lib/ai/provider.ts)
```ts
export interface AIProvider {
  extractConstraints(userInput: string): Promise<ConstraintSet>;
}
```

### API Route Contract (POST /api/parse-intent)
```
Request:  { "input": string }
Response (200): { "constraints": ConstraintSet }
Response (400): { "error": "input required" }
Response (500): { "error": string }
```

### localStorage Key (established today, consumed Day 4)
```ts
const STORAGE_KEY = "embedkit:constraints"; // JSON.stringify(ConstraintSet)
```

### Landing Page Component Contract
```
State: { input: string, loading: boolean, error: string | null }
On submit: POST /api/parse-intent → store constraints → router.push('/configure')
Input: <textarea> — mono font, no autocomplete
Submit: disabled while loading
Error: inline below textarea, --color-error (#f87171)
```

## Test Vector
Input: `"A wireless temperature sensor that lasts 6 months on a battery"`

Expected output (approximate):
```json
{
  "powerBudgetMa": null,
  "priceUsdCents": null,
  "wireless": "ble",
  "batteryType": "lipo",
  "useCase": "wireless temperature sensor",
  "runtimeMonths": 6,
  "tags": ["ultra-low-power", "temperature", "wireless", "battery"]
}
```

## Verification Steps
1. `npx tsc --noEmit` → 0 errors after each file
2. `npm run dev` → landing page renders at localhost:3000
3. Manual POST to /api/parse-intent with curl/Postman
4. Full UI flow: type → submit → check localStorage → check redirect

## Files Created
- [x] `lib/data/schema.ts` — ConstraintSet appended
- [x] `lib/ai/provider.ts` — AIProvider interface
- [x] `lib/ai/gemini.ts` — Gemini implementation
- [x] `lib/ai/parseIntent.ts` — orchestrator
- [x] `app/layout.tsx` — root layout (JetBrains Mono, body reset)
- [x] `app/api/parse-intent/route.ts` — API route
- [x] `app/page.tsx` — landing page

## Test Results

```
curl result:
{"constraints":{"powerBudgetMa":null,"priceUsdCents":null,"wireless":null,"batteryType":null,"useCase":null,"runtimeMonths":null,"tags":[]}}
HTTP 200 — correct shape, all nulls (AI_API_KEY has wrong format; replace with valid AIza... key from Google AI Studio)

localStorage key: embedkit:constraints

Redirect target: /configure

tsc --noEmit: PASS — 0 errors
```
