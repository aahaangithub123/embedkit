// Run with: npx tsx scripts/verify-db.ts
import { getAllComponents, getComponentsByCategory } from '../lib/data/loader';

const components = getAllComponents();
console.log(`\n✅ Total components loaded: ${components.length}`);
console.log(`   Expected: 8\n`);

const categories = ['mcu', 'sensor', 'radio', 'display', 'power'] as const;
for (const cat of categories) {
  const items = getComponentsByCategory(cat);
  console.log(`   ${cat}: ${items.map(c => c.id).join(', ')}`);
}

// Validate required fields
let errors = 0;
for (const c of components) {
  if (!c.id) { console.error(`❌ Missing id`); errors++; }
  if (!c.powerStates?.length) { console.error(`❌ ${c.id}: no powerStates`); errors++; }
  if (!c.interfaces?.length) { console.error(`❌ ${c.id}: no interfaces`); errors++; }
  if (c.priceCents !== Math.floor(c.priceCents)) { console.error(`❌ ${c.id}: priceCents not integer`); errors++; }
}

if (errors === 0) {
  console.log('\n✅ All components valid — Day 2 complete.\n');
} else {
  console.log(`\n❌ ${errors} validation error(s) found.\n`);
  process.exit(1);
}
