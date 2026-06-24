'use client';

import { ScoredComponent } from '@/lib/engine/optimizer';

interface ComponentPickerProps {
  scored: ScoredComponent[];
  selectedIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}

export function ComponentPicker({
  scored,
  selectedIds,
  onAdd,
  onRemove,
}: ComponentPickerProps) {
  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white">
      <h2 className="text-lg font-semibold mb-6">Components</h2>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {scored.length === 0 ? (
          <p className="text-gray-500">No components match constraints</p>
        ) : (
          scored.map(({ component, score, reasons }) => {
            const isSelected = selectedIds.includes(component.id);
            return (
              <div
                key={component.id}
                className={`border rounded-lg p-4 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{component.name}</h3>
                    <p className="text-xs text-gray-600">
                      {component.category} • ${(component.priceCents / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Score: {(score * 100).toFixed(0)}%
                    </div>
                    <button
                      onClick={() => (isSelected ? onRemove(component.id) : onAdd(component.id))}
                      className={`mt-2 px-3 py-1 rounded text-sm font-medium ${
                        isSelected
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {isSelected ? 'Remove' : 'Add'}
                    </button>
                  </div>
                </div>

                {reasons.length > 0 && (
                  <div className="text-xs text-gray-700 space-y-1">
                    {reasons.map((reason, i) => (
                      <div key={i}>• {reason}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
