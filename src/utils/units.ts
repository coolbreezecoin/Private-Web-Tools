export type UnitCategory = "length" | "mass" | "temperature" | "data";

export interface UnitOption {
  value: string;
}

export interface UnitConversionResult {
  value: number;
  error: string;
}

type FactorTable = Record<string, number>;

const factorTables: Record<Exclude<UnitCategory, "temperature">, FactorTable> = {
  length: {
    mm: 0.001,
    cm: 0.01,
    m: 1,
    km: 1000,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mi: 1609.344,
  },
  mass: {
    mg: 0.000001,
    g: 0.001,
    kg: 1,
    t: 1000,
    oz: 0.028349523125,
    lb: 0.45359237,
  },
  data: {
    bit: 0.125,
    B: 1,
    KB: 1000,
    MB: 1000 ** 2,
    GB: 1000 ** 3,
    TB: 1000 ** 4,
    KiB: 1024,
    MiB: 1024 ** 2,
    GiB: 1024 ** 3,
  },
};

export const unitOptionsByCategory: Record<UnitCategory, UnitOption[]> = {
  length: Object.keys(factorTables.length).map((value) => ({ value })),
  mass: Object.keys(factorTables.mass).map((value) => ({ value })),
  temperature: ["C", "F", "K"].map((value) => ({ value })),
  data: Object.keys(factorTables.data).map((value) => ({ value })),
};

function toCelsius(value: number, unit: string) {
  if (unit === "C") return value;
  if (unit === "F") return ((value - 32) * 5) / 9;
  if (unit === "K") return value - 273.15;
  return null;
}

function fromCelsius(value: number, unit: string) {
  if (unit === "C") return value;
  if (unit === "F") return (value * 9) / 5 + 32;
  if (unit === "K") return value + 273.15;
  return null;
}

export function convertUnit(value: number, from: string, to: string, category: UnitCategory): UnitConversionResult {
  if (!Number.isFinite(value)) {
    return { value: 0, error: "Enter a valid number." };
  }

  if (category === "temperature") {
    const celsius = toCelsius(value, from);
    if (celsius === null) {
      return { value: 0, error: "Invalid source unit." };
    }

    const converted = fromCelsius(celsius, to);
    if (converted === null) {
      return { value: 0, error: "Invalid target unit." };
    }

    return { value: converted, error: "" };
  }

  const table = factorTables[category];
  if (!table) {
    return { value: 0, error: "Invalid unit category." };
  }

  const fromFactor = table[from];
  const toFactor = table[to];
  if (!fromFactor || !toFactor) {
    return { value: 0, error: "Invalid unit." };
  }

  return { value: (value * fromFactor) / toFactor, error: "" };
}
