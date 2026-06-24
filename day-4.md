# Day 4 — Constraint Panel + Filtering Engine

## Status: Complete ✅

## Objective
Wire the engine layer to the UI. constraintSolver.ts filters the component DB → optimizer.ts ranks results → ConstraintBar.tsx lets user adjust → ComponentPicker.tsx shows live-filtered list. Full reactive loop on slider change.

## Deliverables
| File | Type | Purpose |
|---|---|---|
| `lib/engine/constraintSolver.ts` | NEW | Pure filter: voltage + power + price + wireless |
| `lib/engine/optimizer.ts` | NEW | Weighted scorer → ranked ScoredComponent[] |
| `lib/engine/busAnalyzer.ts` | NEW | Conflict detection: VOLT-001, I2C-001, I2C-002 |
| `components/configurator/ConstraintBar.tsx` | NEW | Slider panel, reads localStorage, emits onChange |
| `components/configurator/ComponentPicker.tsx` | NEW | Filtered catalog, add/remove to build |
| `app/configure/page.tsx` | NEW | Page: wires all components, manages state |
| `tsconfig.json` | MODIFY | Added path mappings (@/*) and components/** include |

## Contracts Implemented

### ScoredComponent (lib/engine/optimizer.ts)
```ts
export interface ScoredComponent {
  component: Component;
  score: number;        // 0.0–1.0 composite
  reasons: string[];    // ["Low power efficiency: 0.8", "Tag match: ultra-low-power"]
}
```

### Conflict (lib/engine/busAnalyzer.ts)
```ts
export interface Conflict {
  ruleId: "VOLT-001" | "I2C-001" | "I2C-002";
  severity: "error" | "warning";
  message: string;
  componentIds: string[];
}
```

### constraintSolver
- Filters IN ORDER: voltage (3.3V rail) → power → price → wireless tag
- Returns subset of input components matching all constraints
- Power check: compares constraint.powerBudgetMa to component sleep state [0]

### optimizer
- Weights: power_efficiency 0.4 + price_value 0.3 + ecosystem_maturity 0.2 + tag_relevance 0.1
- Scores from 0.0–1.0
- Returns sorted array (descending by score)
- Reasons array explains score contributions

### busAnalyzer
- VOLT-001: component voltage (supplyVoltageMin/Max) doesn't span 3.3V rail
- I2C-001: two peripherals share an I2C address (primary or alt)
- I2C-002: duplicate component ID in build array
- Runs against selected components only (not all)

### ConstraintBar props
```ts
interface ConstraintBarProps {
  initial: ConstraintSet;
  onChange: (updated: ConstraintSet) => void;
}
```

### ComponentPicker props
```ts
interface ComponentPickerProps {
  scored: ScoredComponent[];
  selectedIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}
```

### localStorage Keys
```ts
"embedkit:constraints"  // ConstraintSet — READ on mount, WRITE on slider change
"embedkit:build"        // string[] of component IDs — NEW today
```

### /configure page state shape
```ts
{
  constraints: ConstraintSet,      // init from localStorage or nullConstraints
  selectedIds: string[],           // init from localStorage or []
  // derived (useMemo):
  // filtered = constraintSolver(allComponents, constraints)
  // scored   = optimizer(filtered, constraints)
  // conflicts = busAnalyzer(selectedComponents)
}
```

## Architecture

### Engine Layer Design Pattern
All three engine functions are **pure** — deterministic, no side effects, safe for React useMemo:
- **constraintSolver(components, constraints)** → filtered Component[]
- **optimizer(filtered, constraints)** → ranked ScoredComponent[] with reasons
- **busAnalyzer(selectedComponents)** → Conflict[] (only VOLT-001, I2C-001, I2C-002)

No async, no AI calls, no localStorage access — all computation is in-memory.

### Reactive Data Flow (/configure page)
```
Slider change
  ↓
setConstraints + localStorage.set
  ↓
useMemo re-runs:
  filtered = constraintSolver(allComponents, constraints)
  scored = optimizer(filtered, constraints)
  ↓
ComponentPicker re-renders (sorted by score)

Add/Remove component
  ↓
setSelectedIds + localStorage.set
  ↓
useMemo re-runs:
  selectedComps = filter allComponents by selectedIds
  conflicts = busAnalyzer(selectedComps)
  ↓
Build Summary + ConflictPanel update
```

### localStorage Keys (Day 4)
```ts
"embedkit:constraints"  // ConstraintSet — written by /configure sliders
"embedkit:build"        // string[] of component IDs — written by Add/Remove buttons
```

### Voltage Rail Assumption
- constraintSolver currently hardcodes 3.3V rail for VOLT-001 voltage check
- This assumption is sufficient for Day 4 (all 8 components support 3.3V)
- Day 5 will add rail selector UI; constraintSolver already structured to accept railV parameter

## Implementation Notes

### Power Efficiency Scoring
- Assumes deep sleep is first power state (index 0)
- Sleep current of 0.004mA (nRF52840) → score 0.35
- Normalizes against 0.1mA reference; clamps to 0.0–1.0

### Price Value Scoring
- Reference price $5.00 (500 cents)
- Component < $5 → higher score
- Component = $8.00 → score 0

### Ecosystem Maturity
- Hard-coded tags: 'nordic', 'arm-cortex', 'bosch', 'semtech'
- Match any tag → full 0.2 points
- No match → 0 points

### Tag Relevance
- Compares constraints.tags (from AI parse) against component.tags
- Fraction of matches × 0.1 weight
- Only scored if constraint.tags.length > 0

### UI Behavior
- ConstraintBar sliders:
  - Power: 0–100mA (disables filter if 0)
  - Price: 0–$50 (disables filter if 0)
  - Wireless: ble | lora | wifi | none (buttons)
- ComponentPicker:
  - Sorted by score (highest first)
  - Green "Add" / Red "Remove" buttons toggle selection
  - Score shown as 0–100%
  - Reasons list explains ranking
- Build Summary:
  - Total price (sum of all selected components)
  - Average sleep current (mean of all selected components)
  - Component count
  - Conflicts shown in red (errors) or yellow (warnings)

### TypeScript Fixes (tsconfig.json)
- Added `ignoreDeprecations: "6.0"` to silence baseUrl deprecation warning
- Added `baseUrl: "."` and `paths: {"@/*": ["./*"]}`
- Added `"components/**/*.tsx"` to include
- Allows `import { X } from "@/lib/..."` syntax throughout

## Test Results
✅ `npx tsc --noEmit` — 0 errors
✅ `npm run dev` — localhost:3000/configure renders
✅ Page hydration: localStorage read on mount, components render after hydration
✅ Slider interaction: values persist to localStorage on change (testable in DevTools)
✅ Component list: 8 components shown, ranked by score

## Verification Checklist
- [x] All 6 new files compile cleanly (TypeScript strict mode)
- [x] /configure page loads at localhost:3000/configure
- [x] Build Summary shows total price + avg sleep current + conflict count
- [x] Sliders trigger onChange handler (verify via console logging)
- [x] Add/Remove buttons toggle selectedIds state
- [x] componentPickerProps.scored array is sorted descending by score

## Known Limitations
- Power budget check only compares to sleep state (index 0); active mode budget not yet implemented
- Wireless filter matches tags exactly (case-sensitive for most, substring for LoRa)
- Ecosystem maturity scoring uses hard-coded tag list (not data-driven)
- No debouncing on slider changes — each slider update re-filters entire DB (acceptable for 8 components)

## Files Created
- [x] lib/engine/constraintSolver.ts
- [x] lib/engine/optimizer.ts
- [x] lib/engine/busAnalyzer.ts
- [x] components/configurator/ConstraintBar.tsx
- [x] components/configurator/ComponentPicker.tsx
- [x] app/configure/page.tsx
- [x] tsconfig.json (modified)
