'use client';

import { useState } from 'react';
import { ScoredComponent } from '@/lib/engine/optimizer';

interface ComponentPickerProps {
  scored: ScoredComponent[];
  selectedIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function ComponentPicker({
  scored,
  selectedIds,
  onAdd,
  onRemove,
}: ComponentPickerProps) {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    'all',
    ...Array.from(new Set(scored.map(s => s.component.category))),
  ];

  const visible =
    activeCategory === 'all'
      ? scored
      : scored.filter(s => s.component.category === activeCategory);

  return (
    <div>
      {/* Category tabs */}
      <div className="flex gap-4 px-4 border-b border-[#2a2d3a]">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`pb-2 pt-3 text-xs font-mono uppercase tracking-wider ${
              activeCategory === cat
                ? 'border-b-2 border-[#60a5fa] text-[#e2e4f0]'
                : 'text-[#6b7099]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Component rows */}
      {visible.length === 0 ? (
        <p className="text-[#6b7099] text-sm text-center py-8">
          No components match current constraints
        </p>
      ) : (
        visible.map(({ component, score }) => {
          const isSelected = selectedIds.includes(component.id);
          const minCurrentMa = Math.min(...component.powerStates.map(s => s.currentMa));

          return (
            <div
              key={component.id}
              className="flex items-center justify-between px-4 py-2 border-b border-[#2a2d3a] hover:bg-[#1a1d27]"
            >
              {/* Left */}
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-[#e2e4f0] text-sm font-sans">{component.name}</span>
                  <span className="text-[9px] uppercase font-mono text-[#6b7099] bg-[#2a2d3a] px-1 rounded ml-2">
                    {component.category}
                  </span>
                </div>
                <span className="text-[#6b7099] text-xs font-mono">⚡ {minCurrentMa}mA</span>
                <span className="text-[#6b7099] text-xs font-mono">
                  ${(component.priceCents / 100).toFixed(2)}
                </span>
              </div>

              {/* Right */}
              <div className="flex items-center gap-3">
                {/* Score bar */}
                <div className="w-12 h-[3px] bg-[#2a2d3a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4ade80]"
                    style={{ width: `${score * 100}%` }}
                  />
                </div>

                {/* Add / In Build button */}
                <button
                  onClick={() => (isSelected ? onRemove(component.id) : onAdd(component.id))}
                  className={`text-xs font-mono px-3 py-1 bg-[#1a1d27] ${
                    isSelected
                      ? 'border border-[#4ade80] text-[#4ade80]'
                      : 'border border-[#2a2d3a] text-[#60a5fa]'
                  }`}
                >
                  {isSelected ? '✓ IN BUILD' : 'ADD'}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
