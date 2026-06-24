'use client';

import { useState, useEffect, useMemo } from 'react';
import { ConstraintSet } from '@/lib/data/schema';
import { getAllComponents } from '@/lib/data/loader';
import { constraintSolver } from '@/lib/engine/constraintSolver';
import { optimizer } from '@/lib/engine/optimizer';
import { busAnalyzer, Conflict } from '@/lib/engine/busAnalyzer';
import { ConstraintBar } from '@/components/configurator/ConstraintBar';
import { ComponentPicker } from '@/components/configurator/ComponentPicker';

const STORAGE_CONSTRAINTS_KEY = 'embedkit:constraints';
const STORAGE_BUILD_KEY = 'embedkit:build';

const nullConstraints: ConstraintSet = {
  powerBudgetMa: null,
  priceUsdCents: null,
  wireless: null,
  batteryType: null,
  useCase: null,
  runtimeMonths: null,
  tags: [],
};

export default function ConfigurePage() {
  const allComponents = getAllComponents();
  const [hydrated, setHydrated] = useState(false);
  const [constraints, setConstraints] = useState<ConstraintSet>(nullConstraints);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const savedConstraints = localStorage.getItem(STORAGE_CONSTRAINTS_KEY);
    const savedBuild = localStorage.getItem(STORAGE_BUILD_KEY);

    if (savedConstraints) {
      try {
        setConstraints(JSON.parse(savedConstraints));
      } catch {
        setConstraints(nullConstraints);
      }
    }

    if (savedBuild) {
      try {
        setSelectedIds(JSON.parse(savedBuild));
      } catch {
        setSelectedIds([]);
      }
    }

    setHydrated(true);
  }, []);

  const handleConstraintsChange = (updated: ConstraintSet) => {
    setConstraints(updated);
    localStorage.setItem(STORAGE_CONSTRAINTS_KEY, JSON.stringify(updated));
  };

  const handleAdd = (id: string) => {
    const newIds = [...selectedIds, id];
    setSelectedIds(newIds);
    localStorage.setItem(STORAGE_BUILD_KEY, JSON.stringify(newIds));
  };

  const handleRemove = (id: string) => {
    const newIds = selectedIds.filter(i => i !== id);
    setSelectedIds(newIds);
    localStorage.setItem(STORAGE_BUILD_KEY, JSON.stringify(newIds));
  };

  const { filtered, scored, selectedComponents, conflicts } = useMemo(() => {
    const filtered = constraintSolver(allComponents, constraints);
    const scored = optimizer(filtered, constraints);
    const selectedComps = allComponents.filter((c: any) => selectedIds.includes(c.id));
    const conflicts = busAnalyzer(selectedComps);
    return { filtered, scored, selectedComponents: selectedComps, conflicts };
  }, [constraints, selectedIds]);

  if (!hydrated) {
    return <div className="p-8">Loading...</div>;
  }

  const totalPrice = selectedComponents.reduce((sum: number, c: any) => sum + c.priceCents, 0);
  const avgSleepCurrent = selectedComponents.length
    ? selectedComponents.reduce((sum: number, c: any) => sum + (c.powerStates[0]?.currentMa ?? 0), 0) /
      selectedComponents.length
    : 0;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Component Configurator</h1>
        <p className="text-gray-600 mb-8">
          Filter by constraints • Pick components • Check conflicts
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Constraint controls */}
          <div>
            <ConstraintBar initial={constraints} onChange={handleConstraintsChange} />
          </div>

          {/* Center: Component picker */}
          <div className="lg:col-span-2">
            <ComponentPicker
              scored={scored}
              selectedIds={selectedIds}
              onAdd={handleAdd}
              onRemove={handleRemove}
            />
          </div>
        </div>

        {/* Build Summary */}
        {selectedComponents.length > 0 && (
          <div className="mt-8 border border-gray-300 rounded-lg p-6 bg-white">
            <h2 className="text-lg font-semibold mb-4">Build Summary</h2>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600">Total Price</p>
                <p className="text-2xl font-bold">${(totalPrice / 100).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Sleep Current</p>
                <p className="text-2xl font-bold">
                  <code>{avgSleepCurrent.toFixed(4)}mA</code>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Components</p>
                <p className="text-2xl font-bold">{selectedComponents.length}</p>
              </div>
            </div>

            {/* Conflicts */}
            {conflicts.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3 text-red-600">Conflicts ({conflicts.length})</h3>
                <div className="space-y-2">
                  {conflicts.map((conflict: Conflict, i: number) => (
                    <div
                      key={i}
                      className={`p-3 rounded text-sm ${
                        conflict.severity === 'error'
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      }`}
                    >
                      <strong>{conflict.ruleId}:</strong> {conflict.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {conflicts.length === 0 && (
              <div className="border-t pt-6">
                <p className="text-green-700 font-medium">✓ No conflicts detected</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
