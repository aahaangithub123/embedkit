# Day 2 — Component Database Deep Dive

## Objective
Build the static component database: 8 curated JSON files + TypeScript data layer.

## Schema Contract (v1.0)
All fields defined in /lib/data/schema.ts. Key constraints:
- priceCents: integer only (no floats)
- currentMa: float in milliamps
- voltageV: float in volts
- protocol: strict union type
- id: URL-safe, hyphenated, unique across all files

## Components Completed
| ID | File | Status |
|---|---|---|
| nrf52840-mdbt50q | data/mcu/nrf52840.json | ✅ |
| esp32c3-mini | data/mcu/esp32c3.json | ✅ |
| bme280-bosch | data/sensors/bme280.json | ✅ |
| bh1750-rohm | data/sensors/bh1750.json | ✅ |
| sx1262-semtech | data/radio/sx1262.json | ✅ |
| ssd1306-oled | data/display/ssd1306.json | ✅ |
| waveshare-epaper-1in54 | data/display/waveshare-epaper-1in54.json | ✅ |
| tp4056-charger | data/power/tp4056.json | ✅ |

## loader.ts API Contract
- Export: `getAllComponents(): Component[]`
- Export: `getComponentById(id: string): Component | undefined`
- Export: `getComponentsByCategory(cat: string): Component[]`
- Input: Static JSON imports (no fs, no dynamic require — Vercel-safe)
- No async — synchronous module-level data

## Files Created
- [x] `lib/data/schema.ts` — Component interface v1.0 (5 named interfaces + 2 inline subtypes), `tsc --noEmit` clean
- [x] `lib/data/loader.ts` — 5 exports, explicit static imports, Vercel-safe
- [x] `scripts/verify-db.ts` — validation script

## Verification Results
```
✅ Total components loaded: 8
   Expected: 8

   mcu: nrf52840-mdbt50q, esp32c3-mini
   sensor: bme280-bosch, bh1750-rohm
   radio: sx1262-semtech
   display: ssd1306-oled, waveshare-epaper-1in54
   power: tp4056-charger

✅ All components valid — Day 2 complete.
```
`tsc --noEmit` → 0 errors. `npx tsx scripts/verify-db.ts` → 0 validation errors.
