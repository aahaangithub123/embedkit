// Single source of truth — every /data JSON must satisfy Component.

export interface PowerState {
  label: string;
  currentMa: number;
  voltageV: number;
  notes: string;
}

export interface BusInterface {
  protocol: "I2C" | "SPI" | "UART" | "USB" | "GPIO" | "PWM" | "ADC" | "LoRa";
  role: "controller" | "peripheral" | "both";
  defaultAddress?: string;
  altAddresses?: string[];
  maxSpeedKhz?: number;
  voltageV: number;
}

export interface PassiveCircuitComponent {
  type: "capacitor" | "resistor" | "inductor" | "ferrite";
  value: string;
  spec: string;
  placement: string;
}

export interface PassiveCircuit {
  label: string;
  why: string;
  components: PassiveCircuitComponent[];
}

export interface SchematicPin {
  name: string;
  type: "power" | "ground" | "digital" | "analog" | "bus";
  side: "left" | "right" | "top" | "bottom";
}

export interface Component {
  id: string;
  name: string;
  category: "mcu" | "sensor" | "radio" | "display" | "power" | "io";
  subcategory: string;
  manufacturer: string;
  partNumber: string;
  priceCents: number;
  buyUrl: string;
  supplyVoltageMin: number;
  supplyVoltageMax: number;
  powerStates: PowerState[];
  interfaces: BusInterface[];
  mcu?: {
    cpuMhz: number;
    flashKb: number;
    ramKb: number;
    gpioPins: number;
    adcChannels: number;
    hasUsb: boolean;
    hasBluetooth: boolean;
    hasWifi: boolean;
  };
  sensor?: {
    measures: string[];
    accuracyNotes: string;
    dofCount?: number;
  };
  passiveCircuits: PassiveCircuit[];
  packageType: string;
  schematicPins: SchematicPin[];
  datasheetUrl: string;
  tags: string[];
  compatibleWith: string[];
}
