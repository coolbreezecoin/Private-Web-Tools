export type SortOrder = "asc" | "desc";

export interface SortLinesOptions {
  order: SortOrder;
  caseInsensitive?: boolean;
}

export interface DedupeLinesOptions {
  caseInsensitive?: boolean;
  trim?: boolean;
}

function splitLines(text: string) {
  return text.replace(/\r\n?/g, "\n").split("\n");
}

function normalizeLine(line: string, options: DedupeLinesOptions) {
  const value = options.trim ? line.trim() : line;
  return options.caseInsensitive ? value.toLocaleLowerCase() : value;
}

export function sortLines(text: string, options: SortLinesOptions): string {
  const direction = options.order === "desc" ? -1 : 1;
  return splitLines(text)
    .sort((left, right) => {
      const a = options.caseInsensitive ? left.toLocaleLowerCase() : left;
      const b = options.caseInsensitive ? right.toLocaleLowerCase() : right;
      return a.localeCompare(b) * direction;
    })
    .join("\n");
}

export function dedupeLines(text: string, options: DedupeLinesOptions = {}): string {
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const line of splitLines(text)) {
    const key = normalizeLine(line, options);
    if (seen.has(key)) continue;

    seen.add(key);
    deduped.push(options.trim ? line.trim() : line);
  }

  return deduped.join("\n");
}

export function reverseLines(text: string): string {
  return splitLines(text).reverse().join("\n");
}

export function removeEmptyLines(text: string): string {
  return splitLines(text)
    .filter((line) => line.trim().length > 0)
    .join("\n");
}

export function trimLines(text: string): string {
  return splitLines(text)
    .map((line) => line.trim())
    .join("\n");
}
