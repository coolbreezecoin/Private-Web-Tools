export interface TimestampToDateResult {
  iso: string;
  utc: string;
  local: string;
}

export interface DateToTimestampResult {
  seconds: string;
  milliseconds: string;
}

export interface ConversionResult<T> {
  value?: T;
  error?: string;
}

function isValidDate(date: Date) {
  return Number.isFinite(date.getTime());
}

export function timestampToDate(input: string): ConversionResult<TimestampToDateResult> {
  const value = Number(input.trim());
  if (!Number.isFinite(value)) {
    return { error: "Invalid timestamp." };
  }

  const milliseconds = Math.abs(value) >= 1_000_000_000_000 ? value : value * 1000;
  const date = new Date(milliseconds);
  if (!isValidDate(date)) {
    return { error: "Invalid timestamp." };
  }

  return {
    value: {
      iso: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toLocaleString(),
    },
  };
}

export function dateToTimestamp(input: string): ConversionResult<DateToTimestampResult> {
  const date = new Date(input.trim());
  if (!isValidDate(date)) {
    return { error: "Invalid date." };
  }

  const milliseconds = date.getTime();

  return {
    value: {
      seconds: Math.floor(milliseconds / 1000).toString(),
      milliseconds: milliseconds.toString(),
    },
  };
}

export function currentUnixSeconds() {
  return Math.floor(Date.now() / 1000).toString();
}
