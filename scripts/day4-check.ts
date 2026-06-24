import { constraintSolver } from '../lib/engine/constraintSolver';
import { optimizer } from '../lib/engine/optimizer';
import { busAnalyzer } from '../lib/engine/busAnalyzer';
import { getAllComponents } from '../lib/data/loader';

const components = getAllComponents();
const nullC = { powerBudgetMa: null, priceUsdCents: null, wireless: null, batteryType: null, useCase: null, runtimeMonths: null, tags: [] };
const filtered = constraintSolver(components, nullC);
const scored = optimizer(filtered, nullC);
const conflicts = busAnalyzer([]);

console.log(`DB: ${components.length} components`);
console.log(`Filtered (no constraints): ${filtered.length}`);
console.log(`Top scored: ${scored[0]?.component.name} (${scored[0]?.score.toFixed(3)})`);
console.log(`Conflicts (empty build): ${conflicts.length}`);
