export type DiffSegmentType = "added" | "removed" | "unchanged";

export interface DiffSegment {
  type: DiffSegmentType;
  line: string;
}

export interface DiffOptions {
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
  normalizeEol: boolean;
}

export interface DiffCounts {
  added: number;
  removed: number;
  unchanged: number;
}

export interface DiffResult {
  segments: DiffSegment[];
  counts: DiffCounts;
}

function normalizeInput(input: string, normalizeEol: boolean) {
  return normalizeEol ? input.replace(/\r\n?/g, "\n") : input;
}

function compareLine(line: string, options: DiffOptions) {
  let value = line;
  if (options.ignoreWhitespace) value = value.trim();
  if (options.ignoreCase) value = value.toLowerCase();
  return value;
}

export function diffLines(original: string, changed: string, options: DiffOptions): DiffResult {
  const leftLines = normalizeInput(original, options.normalizeEol).split("\n");
  const rightLines = normalizeInput(changed, options.normalizeEol).split("\n");
  const leftComparable = leftLines.map((line) => compareLine(line, options));
  const rightComparable = rightLines.map((line) => compareLine(line, options));
  const rows = leftLines.length;
  const columns = rightLines.length;
  const table = Array.from({ length: rows + 1 }, () => Array<number>(columns + 1).fill(0));

  for (let row = rows - 1; row >= 0; row -= 1) {
    for (let column = columns - 1; column >= 0; column -= 1) {
      table[row][column] =
        leftComparable[row] === rightComparable[column]
          ? table[row + 1][column + 1] + 1
          : Math.max(table[row + 1][column], table[row][column + 1]);
    }
  }

  const segments: DiffSegment[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < rows && rightIndex < columns) {
    if (leftComparable[leftIndex] === rightComparable[rightIndex]) {
      segments.push({ type: "unchanged", line: leftLines[leftIndex] });
      leftIndex += 1;
      rightIndex += 1;
    } else if (table[leftIndex + 1][rightIndex] >= table[leftIndex][rightIndex + 1]) {
      segments.push({ type: "removed", line: leftLines[leftIndex] });
      leftIndex += 1;
    } else {
      segments.push({ type: "added", line: rightLines[rightIndex] });
      rightIndex += 1;
    }
  }

  while (leftIndex < rows) {
    segments.push({ type: "removed", line: leftLines[leftIndex] });
    leftIndex += 1;
  }

  while (rightIndex < columns) {
    segments.push({ type: "added", line: rightLines[rightIndex] });
    rightIndex += 1;
  }

  const counts = segments.reduce<DiffCounts>(
    (total, segment) => ({ ...total, [segment.type]: total[segment.type] + 1 }),
    { added: 0, removed: 0, unchanged: 0 },
  );

  return { segments, counts };
}

export function formatDiffText(segments: DiffSegment[]) {
  return segments
    .map((segment) => {
      if (segment.type === "added") return `+ ${segment.line}`;
      if (segment.type === "removed") return `- ${segment.line}`;
      return `  ${segment.line}`;
    })
    .join("\n");
}
