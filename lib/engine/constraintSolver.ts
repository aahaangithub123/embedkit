import { Component, ConstraintSet } from '../data/schema';

/**
 * Filters components against user constraints in a fixed order:
 * 1. Voltage  — always runs; keeps components whose supply range spans railV
 * 2. Power    — if powerBudgetMa set; checks MINIMUM power state across all states
 * 3. Price    — if priceUsdCents set; checks component unit price
 * 4. Wireless — if wireless set; MCUs and non-radio components always pass;
 *               only radio-category components with a mismatched protocol are excluded
 *
 * Voltage rail defaults to 3.3V (Day 5 will expose a rail selector in the UI).
 * Tags are not filtered here — they are used by optimizer for scoring only.
 */
export function constraintSolver(
  components: Component[],
  constraints: ConstraintSet,
  railV: number = 3.3
): Component[] {
  return components.filter(comp => {
    // 1. VOLTAGE — keep if railV sits within the component's supply range
    if (comp.supplyVoltageMin > railV || comp.supplyVoltageMax < railV) {
      return false;
    }

    // 2. POWER — check the MINIMUM power state across all states
    if (constraints.powerBudgetMa !== null) {
      const minCurrentMa = Math.min(...comp.powerStates.map(s => s.currentMa));
      if (minCurrentMa > constraints.powerBudgetMa) {
        return false;
      }
    }

    // 3. PRICE — unit price must not exceed budget
    if (constraints.priceUsdCents !== null) {
      if (comp.priceCents > constraints.priceUsdCents) {
        return false;
      }
    }

    // 4. WIRELESS — MCUs and non-radio components always pass
    if (constraints.wireless !== null) {
      if (comp.category !== 'radio') {
        return true;
      }
      // For radio components, check protocol match
      const protocols = comp.interfaces.map(i => i.protocol);
      if (constraints.wireless === 'ble') {
        const hasBle = comp.mcu?.hasBluetooth || comp.tags.includes('ble') || comp.tags.includes('bluetooth');
        if (!hasBle) return false;
      } else if (constraints.wireless === 'lora') {
        const hasLora = comp.tags.some(t => t.toLowerCase().includes('lora')) || protocols.includes('LoRa');
        if (!hasLora) return false;
      } else if (constraints.wireless === 'wifi') {
        const hasWifi = comp.mcu?.hasWifi || comp.tags.includes('wifi');
        if (!hasWifi) return false;
      }
    }

    return true;
  });
}
