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
