import { Component } from '../data/schema';

export interface Conflict {
  ruleId: 'VOLT-001' | 'I2C-001' | 'I2C-002';
  severity: 'error' | 'warning';
  message: string;
  componentIds: string[];
}

export function busAnalyzer(components: Component[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const RAIL_VOLTAGE = 3.3;

  // VOLT-001: component voltage doesn't match 3.3V rail
  for (const comp of components) {
    if (comp.supplyVoltageMin > RAIL_VOLTAGE || comp.supplyVoltageMax < RAIL_VOLTAGE) {
      conflicts.push({
        ruleId: 'VOLT-001',
        severity: 'error',
        message: `${comp.name} requires ${comp.supplyVoltageMin}–${comp.supplyVoltageMax}V, not compatible with 3.3V rail`,
        componentIds: [comp.id],
      });
    }
  }

  // I2C conflicts: address collisions
  const i2cComponents = components.filter(c =>
    c.interfaces.some(i => i.protocol === 'I2C' && i.role === 'peripheral')
  );

  for (let i = 0; i < i2cComponents.length; i++) {
    for (let j = i + 1; j < i2cComponents.length; j++) {
      const comp1 = i2cComponents[i];
      const comp2 = i2cComponents[j];

      const iface1 = comp1.interfaces.find(i => i.protocol === 'I2C');
      const iface2 = comp2.interfaces.find(i => i.protocol === 'I2C');

      if (!iface1 || !iface2) continue;

      const addrs1 = [iface1.defaultAddress, ...(iface1.altAddresses || [])];
      const addrs2 = [iface2.defaultAddress, ...(iface2.altAddresses || [])];

      const hasOverlap = addrs1.some(a => a && addrs2.includes(a));

      if (hasOverlap) {
        conflicts.push({
          ruleId: 'I2C-001',
          severity: 'error',
          message: `I2C address conflict: ${comp1.name} and ${comp2.name} both use same address`,
          componentIds: [comp1.id, comp2.id],
        });
      }
    }
  }

  // I2C-002: duplicate component (same ID in build twice)
  const idCounts = new Map<string, string[]>();
  for (const comp of components) {
    idCounts.set(comp.id, [...(idCounts.get(comp.id) || []), comp.id]);
  }

  for (const [id, ids] of idCounts) {
    if (ids.length > 1) {
      conflicts.push({
        ruleId: 'I2C-002',
        severity: 'warning',
        message: `Duplicate component: ${id} added multiple times to build`,
        componentIds: ids,
      });
    }
  }

  return conflicts;
}
