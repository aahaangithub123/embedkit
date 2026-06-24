'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ConstraintSet, Component } from '@/lib/data/schema';
import { getAllComponents } from '@/lib/data/loader';
import { constraintSolver } from '@/lib/engine/constraintSolver';
import { optimizer, ScoredComponent } from '@/lib/engine/optimizer';
import { busAnalyzer, Conflict } from '@/lib/engine/busAnalyzer';
import ConstraintBar from '@/components/configurator/ConstraintBar';
import ComponentPicker from '@/components/configurator/ComponentPicker';

const STORAGE_CONSTRAINTS = 'embedkit:constraints';
const STORAGE_BUILD = 'embedkit:build';
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
  const [constraints, setConstraints] = useState<ConstraintSet>(nullConstraints);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CONSTRAINTS);
      setConstraints(raw ? JSON.parse(raw) : nullConstraints);
    } catch {
      setConstraints(nullConstraints);
    }
    try {
      const raw = localStorage.getItem(STORAGE_BUILD);
      setSelectedIds(raw ? JSON.parse(raw) : []);
    } catch {
      setSelectedIds([]);
    }
    setHydrated(true);
  }, []);

  const allComponents = useMemo(() => getAllComponents(), []);

  const filtered = useMemo(
    () => constraintSolver(allComponents, constraints),
    [allComponents, constraints]
  );

  const scored = useMemo(
    () => optimizer(filtered, constraints),
    [filtered, constraints]
  );

  const selectedComponents = useMemo(
    () =>
      selectedIds
        .map(id => allComponents.find(c => c.id === id))
        .filter(Boolean) as Component[],
    [selectedIds, allComponents]
  );

  const conflicts = useMemo(
    () => busAnalyzer(selectedComponents),
    [selectedComponents]
  );

  const handleConstraintChange = useCallback((updated: ConstraintSet) => {
    setConstraints(updated);
    localStorage.setItem(STORAGE_CONSTRAINTS, JSON.stringify(updated));
  }, []);

  const handleAdd = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = [...prev, id];
      localStorage.setItem(STORAGE_BUILD, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = prev.filter(x => x !== id);
      localStorage.setItem(STORAGE_BUILD, JSON.stringify(next));
      return next;
    });
  }, []);

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e2e4f0]">
      <ConstraintBar initial={constraints} onChange={handleConstraintChange} />

      <div className="grid grid-cols-[1fr_320px] h-[calc(100vh-52px)]">
        {/* Left: component list */}
        <div className="overflow-y-auto border-r border-[#2a2d3a]">
          <ComponentPicker
            scored={scored}
            selectedIds={selectedIds}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        </div>

        {/* Right: build sidebar */}
        <div className="flex flex-col overflow-y-auto">
          <div className="text-[#6b7099] text-xs uppercase font-mono px-4 py-2 border-b border-[#2a2d3a]">
            BUILD
          </div>

          {selectedIds.length === 0 ? (
            <p className="text-[#6b7099] text-xs px-4 py-3">No components added yet</p>
          ) : (
            selectedComponents.map(comp => {
              const minCurrentMa = Math.min(...comp.powerStates.map(s => s.currentMa));
              return (
                <div
                  key={comp.id}
                  className="flex justify-between items-center px-4 py-2 border-b border-[#2a2d3a]"
                >
                  <span className="text-[#e2e4f0] text-xs font-sans">{comp.name}</span>
                  <span className="text-[#6b7099] text-xs font-mono">⚡ {minCurrentMa}mA</span>
                </div>
              );
            })
          )}

          {/* Conflicts */}
          {conflicts.map((conflict: Conflict, i: number) => (
            <div
              key={i}
              className={`flex gap-2 px-4 py-2 text-xs font-mono ${
                conflict.severity === 'error' ? 'text-[#f87171]' : 'text-[#fb923c]'
              }`}
            >
              <span>{conflict.severity === 'error' ? '●' : '▲'}</span>
              <span>{conflict.message}</span>
            </div>
          ))}

          {/* Stats */}
          <div className="mt-auto border-t border-[#2a2d3a] px-4 py-2 space-y-1">
            <p className="text-[#6b7099] text-xs font-mono">
              COMPONENTS: {selectedIds.length}
            </p>
            <p className="text-[#6b7099] text-xs font-mono">
              FILTERED: {scored.length} / {allComponents.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
