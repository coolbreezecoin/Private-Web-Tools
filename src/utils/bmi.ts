export type BmiError = "invalid";
export type BmiCategoryKey = "underweight" | "normal" | "overweight" | "obese";

export interface BmiResult {
  value: number | null;
  category: BmiCategoryKey | null;
  error: BmiError | null;
}

const poundsToKg = 0.45359237;
const inchesToMeters = 0.0254;

function validPositive(value: number) {
  return Number.isFinite(value) && value > 0;
}

export function bmiCategory(value: number): BmiCategoryKey {
  if (value < 18.5) return "underweight";
  if (value < 25) return "normal";
  if (value < 30) return "overweight";
  return "obese";
}

export function bmi(weightKg: number, heightM: number): BmiResult {
  if (!validPositive(weightKg) || !validPositive(heightM)) {
    return { value: null, category: null, error: "invalid" };
  }

  const value = weightKg / heightM ** 2;
  if (!Number.isFinite(value)) {
    return { value: null, category: null, error: "invalid" };
  }

  return { value, category: bmiCategory(value), error: null };
}

export function bmiFromImperial(weightLb: number, heightIn: number): BmiResult {
  if (!validPositive(weightLb) || !validPositive(heightIn)) {
    return { value: null, category: null, error: "invalid" };
  }

  return bmi(weightLb * poundsToKg, heightIn * inchesToMeters);
}
