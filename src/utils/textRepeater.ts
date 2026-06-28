export interface TextRepeaterOptions {
  separator: string;
  numbered?: boolean;
}

export const MAX_REPEAT_COUNT = 10000;

export function clampRepeatCount(count: number) {
  if (!Number.isFinite(count)) return 1;
  return Math.min(MAX_REPEAT_COUNT, Math.max(0, Math.floor(count)));
}

export function repeatText(text: string, count: number, { separator, numbered = false }: TextRepeaterOptions) {
  const safeCount = clampRepeatCount(count);
  if (!text || safeCount === 0) return "";

  return Array.from({ length: safeCount }, (_, index) => (numbered ? `${index + 1}. ${text}` : text)).join(separator);
}
