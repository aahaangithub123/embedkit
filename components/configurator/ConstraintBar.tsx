'use client';

import { useState, useEffect } from 'react';
import { ConstraintSet } from '@/lib/data/schema';

interface ConstraintBarProps {
  initial: ConstraintSet;
  onChange: (updated: ConstraintSet) => void;
}

export function ConstraintBar({ initial, onChange }: ConstraintBarProps) {
  const [constraints, setConstraints] = useState<ConstraintSet>(initial);

  useEffect(() => {
    setConstraints(initial);
  }, [initial]);

  const handleChange = (key: keyof Omit<ConstraintSet, 'tags'>, value: number | null) => {
    const updated = { ...constraints, [key]: value };
    setConstraints(updated);
    onChange(updated);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white">
      <h2 className="text-lg font-semibold mb-6">Constraints</h2>

      <div className="space-y-6">
        {/* Power Budget */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Max Power (mA): {constraints.powerBudgetMa ?? 'Any'}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={constraints.powerBudgetMa ?? 0}
            onChange={e => {
              const val = Number(e.target.value);
              handleChange('powerBudgetMa', val > 0 ? val : null);
            }}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">Sleep mode current draw</p>
        </div>

        {/* Price Budget */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Max Price: {constraints.priceUsdCents ? `$${(constraints.priceUsdCents / 100).toFixed(2)}` : 'Any'}
          </label>
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={constraints.priceUsdCents ?? 0}
            onChange={e => {
              const val = Number(e.target.value);
              handleChange('priceUsdCents', val > 0 ? val : null);
            }}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">Total BOM cost limit</p>
        </div>

        {/* Wireless */}
        <div>
          <label className="block text-sm font-medium mb-2">Wireless</label>
          <div className="flex gap-2">
            {['ble', 'lora', 'wifi', 'none'].map(opt => (
              <button
                key={opt}
                onClick={() => {
                  const updated = { ...constraints, wireless: opt === 'none' ? null : opt };
                  setConstraints(updated);
                  onChange(updated);
                }}
                className={`px-3 py-2 rounded text-sm font-medium ${
                  (opt === 'none' ? constraints.wireless === null : constraints.wireless === opt)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
