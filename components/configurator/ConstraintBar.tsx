'use client';

import { useState, useCallback } from 'react';
import { ConstraintSet } from '@/lib/data/schema';

interface ConstraintBarProps {
  initial: ConstraintSet;
  onChange: (updated: ConstraintSet) => void;
}

const WIRELESS_OPTIONS = ['BLE', 'LoRa', 'WiFi'] as const;
const BATTERY_OPTIONS = ['LiPo', 'AAA', 'Coin'] as const;

type WirelessOption = typeof WIRELESS_OPTIONS[number];
type BatteryOption = typeof BATTERY_OPTIONS[number];

const toWirelessKey = (opt: WirelessOption): string =>
  opt === 'LoRa' ? 'lora' : opt.toLowerCase();

const toBatteryKey = (opt: BatteryOption): string => opt.toLowerCase();

export default function ConstraintBar({ initial, onChange }: ConstraintBarProps) {
  const [constraints, setConstraints] = useState<ConstraintSet>(initial);

  const update = useCallback((patch: Partial<ConstraintSet>) => {
    setConstraints(prev => {
      const next = { ...prev, ...patch };
      onChange(next);
      return next;
    });
  }, [onChange]);

  const activeDot = (active: boolean) => (
    <span
      className="w-2 h-2 rounded-full inline-block"
      style={{ backgroundColor: active ? '#4ade80' : '#2a2d3a' }}
    />
  );

  const currentWireless = constraints.wireless?.toLowerCase() ?? null;
  const currentBattery = constraints.batteryType?.toLowerCase() ?? null;

  return (
    <div className="flex items-center gap-6 px-4 py-3 bg-[#1a1d27] border-b border-[#2a2d3a]">

      {/* 1. Power Budget */}
      <div className="flex items-center gap-2">
        {activeDot(constraints.powerBudgetMa !== null)}
        <input
          type="checkbox"
          checked={constraints.powerBudgetMa !== null}
          onChange={e => update({ powerBudgetMa: e.target.checked ? 100 : null })}
          className="accent-[#60a5fa]"
        />
        <span className="text-[#6b7099] text-xs font-sans uppercase tracking-wider">PWR</span>
        <input
          type="range"
          min={0}
          max={500}
          step={5}
          disabled={constraints.powerBudgetMa === null}
          value={constraints.powerBudgetMa ?? 500}
          onChange={e => update({ powerBudgetMa: Number(e.target.value) })}
          className="w-24 accent-[#60a5fa] disabled:opacity-30"
        />
        <span className="text-[#e2e4f0] text-xs font-mono w-16">
          {constraints.powerBudgetMa !== null ? `${constraints.powerBudgetMa}mA` : '—'}
        </span>
      </div>

      {/* 2. Price Ceiling */}
      <div className="flex items-center gap-2">
        {activeDot(constraints.priceUsdCents !== null)}
        <input
          type="checkbox"
          checked={constraints.priceUsdCents !== null}
          onChange={e => update({ priceUsdCents: e.target.checked ? 500 : null })}
          className="accent-[#60a5fa]"
        />
        <span className="text-[#6b7099] text-xs font-sans uppercase tracking-wider">PRICE</span>
        <input
          type="range"
          min={0}
          max={2000}
          step={25}
          disabled={constraints.priceUsdCents === null}
          value={constraints.priceUsdCents ?? 2000}
          onChange={e => update({ priceUsdCents: Number(e.target.value) })}
          className="w-24 accent-[#60a5fa] disabled:opacity-30"
        />
        <span className="text-[#e2e4f0] text-xs font-mono w-16">
          {constraints.priceUsdCents !== null
            ? `$${(constraints.priceUsdCents / 100).toFixed(2)}`
            : '—'}
        </span>
      </div>

      {/* 3. Wireless */}
      <div className="flex items-center gap-2">
        {activeDot(constraints.wireless !== null)}
        <span className="text-[#6b7099] text-xs font-sans uppercase tracking-wider">WIRELESS</span>
        <div className="flex gap-1">
          {WIRELESS_OPTIONS.map(opt => {
            const key = toWirelessKey(opt);
            const active = currentWireless === key;
            return (
              <button
                key={opt}
                onClick={() => update({ wireless: active ? null : key })}
                className={`px-2 py-0.5 text-xs rounded ${
                  active
                    ? 'bg-[#60a5fa] text-[#0f1117]'
                    : 'bg-[#1a1d27] text-[#6b7099] border border-[#2a2d3a]'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Battery */}
      <div className="flex items-center gap-2">
        {activeDot(constraints.batteryType !== null)}
        <span className="text-[#6b7099] text-xs font-sans uppercase tracking-wider">BATTERY</span>
        <div className="flex gap-1">
          {BATTERY_OPTIONS.map(opt => {
            const key = toBatteryKey(opt);
            const active = currentBattery === key;
            return (
              <button
                key={opt}
                onClick={() => update({ batteryType: active ? null : key })}
                className={`px-2 py-0.5 text-xs rounded ${
                  active
                    ? 'bg-[#60a5fa] text-[#0f1117]'
                    : 'bg-[#1a1d27] text-[#6b7099] border border-[#2a2d3a]'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
