export type AgeError = "invalidDate" | "futureDate";

export interface AgeBreakdown {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
}

export interface AgeResult {
  value: AgeBreakdown | null;
  error: AgeError | null;
}

interface DateParts {
  year: number;
  month: number;
  day: number;
}

const msPerDay = 24 * 60 * 60 * 1000;

function parseDateOnly(value: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { year, month, day };
}

function compareDates(a: DateParts, b: DateParts) {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function toUtcDay(parts: DateParts) {
  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

function calendarDifference(start: DateParts, end: DateParts): AgeBreakdown {
  let years = end.year - start.year;
  let months = end.month - start.month;
  let days = end.day - start.day;

  if (days < 0) {
    months -= 1;
    const borrowMonth = end.month === 1 ? 12 : end.month - 1;
    const borrowYear = end.month === 1 ? end.year - 1 : end.year;
    days += daysInMonth(borrowYear, borrowMonth);
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.round((toUtcDay(end) - toUtcDay(start)) / msPerDay);

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    totalMonths: years * 12 + months,
  };
}

export function ageBetween(birthDate: string, onDate: string): AgeResult {
  const birth = parseDateOnly(birthDate);
  const on = parseDateOnly(onDate);

  if (!birth || !on) return { value: null, error: "invalidDate" };
  if (compareDates(birth, on) > 0) return { value: null, error: "futureDate" };

  return { value: calendarDifference(birth, on), error: null };
}
