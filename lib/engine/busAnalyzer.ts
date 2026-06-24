import { Component } from '../data/schema';

export type ConflictRuleId = 'VOLT-001' | 'I2C-001' | 'I2C-002';
export type ConflictSeverity = 'error' | 'warning';

export interface Conflict {
  ruleId: ConflictRuleId;
  severity: ConflictSeverity;
  message: string;
  componentIds: string[];
}

export function busAnalyzer(selected: Component[], railV: number = 3.3): Conflict[] {
  const conflicts: Conflict[] = [];

  // VOLT-001: component supply range does not span railV
  for (const comp of selected) {
    if (comp.supplyVoltageMax < railV || comp.supplyVoltageMin > railV) {
      conflicts.push({
        ruleId: 'VOLT-001',
        severity: 'error',
        message: `VOLT-001: ${comp.name} requires ${comp.supplyVoltageMin}–${comp.supplyVoltageMax}V. Current rail is ${railV}V.`,
        componentIds: [comp.id],
      });
    }
  }

  // Collect all I2C peripheral interfaces across all selected components
  interface I2CEntry { comp: Component; defaultAddress: string; altAddresses: string[] }
  const i2cEntries: I2CEntry[] = [];
  for (const comp of selected) {
    for (const iface of comp.interfaces) {
      if (iface.protocol === 'I2C' && iface.role !== 'controller' && iface.defaultAddress) {
        i2cEntries.push({
          comp,
          defaultAddress: iface.defaultAddress,
          altAddresses: iface.altAddresses ?? [],
        });
      }
    }
  }

  // Group entries by defaultAddress
  const byAddress = new Map<string, I2CEntry[]>();
  for (const entry of i2cEntries) {
    const group = byAddress.get(entry.defaultAddress) ?? [];
    group.push(entry);
    byAddress.set(entry.defaultAddress, group);
  }

  for (const [address, group] of byAddress) {
    if (group.length < 2) continue;

    // Check every pair at this address
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i];
        const b = group[j];
        const aHasAlt = a.altAddresses.length > 0;
        const bHasAlt = b.altAddresses.length > 0;

        if (!aHasAlt && !bHasAlt) {
          // I2C-001: hard conflict, no resolution possible
          conflicts.push({
            ruleId: 'I2C-001',
            severity: 'error',
            message: `I2C-001: Address conflict — ${a.comp.name} and ${b.comp.name} both at ${address}. No alternative address available.`,
            componentIds: [a.comp.id, b.comp.id],
          });
        } else {
          // I2C-002: at least one side can move — suggest the one with alts
          const mover = bHasAlt ? b : a;
          const other = mover === b ? a : b;
          conflicts.push({
            ruleId: 'I2C-002',
            severity: 'warning',
            message: `I2C-002: ${mover.comp.name} can move to ${mover.altAddresses[0]} by pulling its ADDR pin LOW.`,
            componentIds: [other.comp.id, mover.comp.id],
          });
        }
      }
    }
  }

  return conflicts;
}
