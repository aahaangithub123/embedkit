# EmbedKit — Master Change Log

## System Architecture Decisions
- Stack: Next.js 14 App Router + TypeScript + Tailwind (utility-only)
- Data: Static JSON files in /data, Git-versioned, no backend
- AI: Provider pattern via /config/ai.config.ts — Gemini 2.0 Flash default
- Persistence: localStorage only, no auth, Vercel free tier deployment

## State Model
- Component data: loaded once at build time from /data/**/*.json via loader.ts
- Project state: { selectedComponents: string[], constraints: ConstraintSet } in localStorage
- AI output: ConstraintSet JSON — only input type accepted by constraintSolver

## Schema Version
- v1.0 — defined in /lib/data/schema.ts
- All component JSON files must validate against Component interface

---

## Day 1 — Project Scaffold
- [x] Next.js 14 + TypeScript + Tailwind initialized
- [x] Folder structure created per blueprint Section 3
- [x] ai.config.ts created with Gemini 2.0 Flash config
- [x] .env.local configured with AI_API_KEY
- [x] GitHub repo + Vercel deployment live

## Day 2 — Component Database
- Status: In Progress
- Target: 8 component JSON files + schema.ts + loader.ts

### Step 6 Complete (Day 2 DONE)
Created lib/data/loader.ts — 4 exports: getAllComponents, getComponentById, getComponentsByCategory, getComponentsByTag
Pattern: explicit static imports (not glob/fs) — required for Vercel static builds
Created scripts/verify-db.ts — validation script confirms 8 components, required fields, integer priceCents
Day 2 checkpoint met: component database operational, data layer ready for Day 4 constraintSolver

### Step 5 Complete
Created data/power/tp4056.json — LiPo charger, RPROG resistor is safety-critical passive
Power states represent INPUT current from USB, not output to battery
Warning: priceCents: 30 (IC only) — module with DW01A protection is ~$0.60, recommend module in UI

### Step 4 Complete
Created data/radio/sx1262.json — LoRa radio, 6 power states, RF matching network documented
Created data/display/ssd1306.json — OLED I2C display, charge pump capacitor critical passive
Created data/display/waveshare-epaper-1in54.json — e-paper, 0.001mA sleep with image retained
Design note: e-paper is only display category where image persists at 0 power — document this prominently in UI

### Step 3 Complete
Created data/sensors/bme280.json — copied from blueprint, verified structure matches schema
Created data/sensors/bh1750.json — 3 power states, I2C peripheral, ADDR pin selectable address
BH1750 one-time measurement mode is key for ultra-low-power: 0.12mA only during 120ms window

### Step 2 Complete
Created data/mcu/nrf52840.json — 5 power states, 5 bus interfaces, 2 passive circuits
Created data/mcu/esp32c3.json — 6 power states, 5 bus interfaces, 2 passive circuits
Note: ESP32-C3 Wi-Fi TX peak 280mA — largest single-component current draw in catalog

### Step 1 Complete
Created /lib/data/schema.ts — Component interface v1.0
8 TypeScript interfaces defined: PowerState, BusInterface, PassiveCircuitComponent, PassiveCircuit, SchematicPin, Component + mcu/sensor subtype objects

Day 3 — AI Layer + Landing Page

AI Architecture


Pattern: Client → POST /api/parse-intent → gemini.ts → Gemini API → ConstraintSet JSON
API key lives ONLY in server-side route handler (process.env.AI_API_KEY). Never sent to browser.
Provider swap point: lib/ai/provider.ts interface. Swap gemini.ts for groq.ts by changing parseIntent.ts import + ai.config.ts provider field.
AI failure is non-blocking: if /api/parse-intent returns 500, landing page shows error inline. Sliders on /configure still work manually.


New Types


ConstraintSet added to lib/data/schema.ts — consumed by Day 4 constraintSolver.ts


localStorage Key Established


Key: embedkit:constraints → JSON string of ConstraintSet
Set: on successful parse-intent response, before redirect
Read: by /configure page (Day 4) to pre-fill sliders


Routing Flow


/ → user types → POST /api/parse-intent → localStorage.set → router.push('/configure')
/configure (Day 4) reads localStorage → pre-fills constraint sliders


Files Added


lib/ai/provider.ts
lib/ai/gemini.ts
lib/ai/parseIntent.ts
lib/ai/provider.ts — AIProvider interface + nullConstraints fallback
lib/ai/gemini.ts — GeminiProvider (OpenAI-compat endpoint)
lib/ai/parseIntent.ts — orchestrator, failure-safe
app/layout.tsx — root layout, JetBrains Mono font via Google Fonts
app/api/parse-intent/route.ts — POST proxy, API key server-only
app/page.tsx — landing page, client component, localStorage → /configure

## Day 3 — Debug Pass

### tsconfig fixes
- Added `app/**/*.ts`, `app/**/*.tsx`, `next-env.d.ts` to include
- Added `.next/dev/types/**/*.ts` to exclude — Next.js 16 auto-manages include but TS6 cannot resolve `.js`→`.tsx` in generated `typeof import()` expressions; exclude survives Next.js rewrites

### .env.local fix
- Removed malformed second line (`"AI_API_KEY=your_gemini_key_here"`) — was invalid dotenv that could corrupt key parse

### API key blocker (user action required)
- Current key (`AQ.` prefix) returns HTTP 404 from Gemini API — wrong key type
- Replace with Google AI Studio key (starts `AIza`) at https://aistudio.google.com/app/apikey
- All other infrastructure verified correct: endpoint URL, request format, JSON parse, error handling, nullConstraints fallback

## Day 4 — Constraint Panel + Filtering Engine
- [x] lib/engine/constraintSolver.ts — Step 1 Complete: 5 filters, railV param defaults 3.3V, wireless logic passes MCUs and non-radio components
- [x] lib/engine/optimizer.ts — Step 2 Complete: 4-weight score, log-scale normalization for power+price, tag relevance neutral at 0.5 when no tags
- [x] lib/engine/busAnalyzer.ts — Step 3 Complete: VOLT-001 (error), I2C-001 (error), I2C-002 (warning) — 3 Tier 1 rules. railV param defaults 3.3V. Returns [] for clean build.
- [x] components/configurator/ConstraintBar.tsx — Step 4 Complete: 4 controls (power/price sliders + wireless/battery button groups). Stateless — parent owns localStorage write. MATLAB aesthetic tokens applied.
- [x] components/configurator/ComponentPicker.tsx — Step 5 Complete: ranked list with category tabs, score bar visualization, add/remove wired to props. Zero internal state except activeCategory tab.
- [x] app/configure/page.tsx — Step 6 Complete (Day 4 DONE): full reactive pipeline wired. constraintSolver→optimizer→busAnalyzer run in useMemo. localStorage write on every state change. Two-column layout: picker left, build + conflicts right. hydration guard prevents SSR mismatch.
- [x] tsconfig.json — added path mappings (@/*), components/** include
- [x] /configure renders live at localhost:3000/configure; scores ranked 0.0–1.0
- Day 4 checkpoint met: engine layer operational. /configure page reactive. Ready for Day 5 powerCalculator + BuildList.

## Day 3 — AI Layer + Landing Page
### AI Architecture
- Pattern: Client → POST /api/parse-intent → gemini.ts → Gemini API → ConstraintSet JSON
- API key lives ONLY in server-side route handler (process.env.AI_API_KEY). Never sent to browser.
- Provider swap point: lib/ai/provider.ts interface. Swap by changing parseIntent.ts import + ai.config.ts provider field.
- AI failure is non-blocking: returns nullConstraints, sliders on /configure still work manually.

### New Types
- ConstraintSet added to lib/data/schema.ts — consumed by Day 4 constraintSolver.ts

### localStorage Key Established
- Key: `embedkit:constraints` → JSON.stringify(ConstraintSet)
- Set: after successful /api/parse-intent response, before redirect
- Read: /configure page (Day 4) pre-fills constraint sliders

### Routing Flow Established
/ → POST /api/parse-intent → localStorage.set → router.push('/configure')

### Files Added (Day 3)
- lib/ai/provider.ts
- lib/ai/gemini.ts
- lib/ai/parseIntent.ts
- app/api/parse-intent/route.ts
- app/page.tsx