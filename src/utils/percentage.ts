export type PercentageError = "invalid" | "divideByZero";

export interface PercentageResult {
  value: number | null;
  error: PercentageError | null;
}

function validNumber(value: number) {
  return Number.isFinite(value);
}

function result(value: number): PercentageResult {
  return { value, error: null };
}

function invalid(): PercentageResult {
  return { value: null, error: "invalid" };
}

export function percentOf(percent: number, number: number): PercentageResult {
  if (!validNumber(percent) || !validNumber(number)) return invalid();
  return result((percent / 100) * number);
}

export function whatPercent(value: number, total: number): PercentageResult {
  if (!validNumber(value) || !validNumber(total)) return invalid();
  if (total === 0) return { value: null, error: "divideByZero" };
  return result((value / total) * 100);
}

export function percentChange(from: number, to: number): PercentageResult {
  if (!validNumber(from) || !validNumber(to)) return invalid();
  if (from === 0) return { value: null, error: "divideByZero" };
  return result(((to - from) / from) * 100);
}
