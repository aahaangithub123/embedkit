// /lib/data/loader.ts
// Static component database loader — Vercel-safe, no fs dependency
// Add new imports here as components are added to /data/**

import { Component } from './schema';

// MCU
import nrf52840 from '../../data/mcu/nrf52840.json';
import esp32c3 from '../../data/mcu/esp32c3.json';

// Sensors
import bme280 from '../../data/sensors/bme280.json';
import bh1750 from '../../data/sensors/bh1750.json';

// Radio
import sx1262 from '../../data/radio/sx1262.json';

// Display
import ssd1306 from '../../data/display/ssd1306.json';
import waveShareEpaper from '../../data/display/waveshare-epaper-1in54.json';

// Power
import tp4056 from '../../data/power/tp4056.json';

const ALL_COMPONENTS: Component[] = [
  nrf52840 as unknown as Component,
  esp32c3 as unknown as Component,
  bme280 as unknown as Component,
  bh1750 as unknown as Component,
  sx1262 as unknown as Component,
  ssd1306 as unknown as Component,
  waveShareEpaper as unknown as Component,
  tp4056 as unknown as Component,
];

export function getAllComponents(): Component[] {
  return ALL_COMPONENTS;
}

export function getComponentById(id: string): Component | undefined {
  return ALL_COMPONENTS.find(c => c.id === id);
}

export function getComponentsByCategory(category: Component['category']): Component[] {
  return ALL_COMPONENTS.filter(c => c.category === category);
}

export function getComponentsByTag(tag: string): Component[] {
  return ALL_COMPONENTS.filter(c => c.tags.includes(tag));
}

export function getComponentCount(): number {
  return ALL_COMPONENTS.length;
}
