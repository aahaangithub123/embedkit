# Day 1 — Scaffold & Deploy

## Goal
Live Vercel URL + correct folder structure + ai.config.ts + schema.ts.

## Checklist
- [ ] create-next-app scaffold (not yet run — app/ and components/ stubbed manually)
- [x] Folder structure (Blueprint §3) — app/, components/, lib/, config/, data/{mcu,sensors,radio,display,power,passive-circuits}
- [x] lib/data/schema.ts
- [x] config/ai.config.ts
- [x] .env.local + .gitignore verified

## Code / Contracts introduced

### `lib/data/schema.ts`
```ts
// Single source of truth — every /data JSON must satisfy Component.

export interface PowerState {
  label: string;
  currentMa: number;
  voltageV: number;
  notes: string;
}

export interface BusInterface {
  protocol: "I2C" | "SPI" | "UART" | "USB" | "GPIO" | "PWM" | "ADC" | "LoRa";
  role: "controller" | "peripheral" | "both";
  defaultAddress?: string;
  altAddresses?: string[];
  maxSpeedKhz?: number;
  voltageV: number;
}

export interface PassiveCircuit {
  label: string;
  why: string;
  components: {
    type: "capacitor" | "resistor" | "inductor" | "ferrite";
    value: string;
    spec: string;
    placement: string;
  }[];
}

export interface Component {
  id: string;
  name: string;
  category: "mcu" | "sensor" | "radio" | "display" | "power" | "io";
  subcategory: string;
  manufacturer: string;
  partNumber: string;
  priceCents: number;
  buyUrl: string;
  supplyVoltageMin: number;
  supplyVoltageMax: number;
  powerStates: PowerState[];
  interfaces: BusInterface[];
  mcu?: {
    cpuMhz: number;
    flashKb: number;
    ramKb: number;
    gpioPins: number;
    adcChannels: number;
    hasUsb: boolean;
    hasBluetooth: boolean;
    hasWifi: boolean;
  };
  sensor?: {
    measures: string[];
    accuracyNotes: string;
    dofCount?: number;
  };
  passiveCircuits: PassiveCircuit[];
  packageType: string;
  schematicPins: {
    name: string;
    type: "power" | "ground" | "digital" | "analog" | "bus";
    side: "left" | "right" | "top" | "bottom";
  }[];
  datasheetUrl: string;
  tags: string[];
  compatibleWith: string[];
}
```
Type-checked clean: `npx tsc --noEmit` → 0 errors.

### `config/ai.config.ts`
```ts
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
```
Type-checked clean: `npx tsc --noEmit` → 0 errors.

## Backlog
- Run `create-next-app` scaffold (Next.js 14, TypeScript, Tailwind, App Router)
- Create Blueprint §3 folder structure under scaffold
- First Vercel deploy
