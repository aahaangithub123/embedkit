import { Component, ConstraintSet } from '../data/schema';

export function constraintSolver(
  components: Component[],
  constraints: ConstraintSet
): Component[] {
  return components.filter(comp => {
    // 1. Voltage: assume 3.3V rail
    if (comp.supplyVoltageMin > 3.3 || comp.supplyVoltageMax < 3.3) {
      return false;
    }

    // 2. Power budget: check minimum sleep current
    if (constraints.powerBudgetMa !== null) {
      const sleepState = comp.powerStates[0];
      if (sleepState && sleepState.currentMa > constraints.powerBudgetMa) {
        return false;
      }
    }

    // 3. Price budget
    if (constraints.priceUsdCents !== null) {
      if (comp.priceCents > constraints.priceUsdCents) {
        return false;
      }
    }

    // 4. Wireless capability
    if (constraints.wireless !== null) {
      const hasWireless = comp.tags.some(tag =>
        (constraints.wireless === 'ble' && tag === 'ble') ||
        (constraints.wireless === 'lora' && tag.toLowerCase().includes('lora')) ||
        (constraints.wireless === 'wifi' && comp.mcu?.hasWifi)
      );
      if (!hasWireless) {
        return false;
      }
    }

    return true;
  });
}
