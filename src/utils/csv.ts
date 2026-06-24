export interface TextConversionResult {
  value: string;
  error: string;
}

export interface CsvOptions {
  delimiter: string;
}

function ok(value: string): TextConversionResult {
  return { value, error: "" };
}

function fail(error: string): TextConversionResult {
  return { value: "", error };
}

function parseCsvRows(input: string, delimiter: string): { rows: string[][]; error: string } {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];

    if (inQuotes) {
      if (character === '"') {
        if (next === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      if (field.length === 0) {
        inQuotes = true;
      } else {
        return { rows: [], error: "Unexpected quote in CSV field." };
      }
      continue;
    }

    if (character === delimiter) {
      row.push(field);
      field = "";
      continue;
    }

    if (character === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (character === "\r") {
      if (next === "\n") continue;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += character;
  }

  if (inQuotes) {
    return { rows: [], error: "CSV has an unclosed quoted field." };
  }

  row.push(field);
  rows.push(row);

  return { rows, error: "" };
}

export function csvToJson(csv: string, { delimiter }: CsvOptions): TextConversionResult {
  if (!csv.trim()) {
    return fail("Enter CSV with a header row.");
  }

  const parsed = parseCsvRows(csv, delimiter);
  if (parsed.error) return fail(parsed.error);

  const rows = parsed.rows.filter((row, index) => index === 0 || row.some((cell) => cell.trim() !== ""));
  const headers = rows[0]?.map((header) => header.trim()) ?? [];

  if (headers.length === 0 || headers.every((header) => !header)) {
    return fail("CSV needs a header row.");
  }

  if (headers.some((header) => !header)) {
    return fail("CSV headers cannot be empty.");
  }

  const data = rows.slice(1).map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])),
  );

  return ok(JSON.stringify(data, null, 2));
}

function formatCsvValue(value: unknown, delimiter: string): string {
  const raw =
    value === null || value === undefined
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);

  if (raw.includes('"') || raw.includes(delimiter) || raw.includes("\n") || raw.includes("\r")) {
    return `"${raw.replaceAll('"', '""')}"`;
  }

  return raw;
}

export function jsonToCsv(jsonText: string, { delimiter }: CsvOptions): TextConversionResult {
  if (!jsonText.trim()) {
    return fail("Enter a JSON array of objects.");
  }

  try {
    const parsed = JSON.parse(jsonText) as unknown;

    if (!Array.isArray(parsed)) {
      return fail("JSON must be an array of objects.");
    }

    if (parsed.some((item) => item === null || typeof item !== "object" || Array.isArray(item))) {
      return fail("Every JSON array item must be an object.");
    }

    const objects = parsed as Record<string, unknown>[];
    const headers = Array.from(new Set(objects.flatMap((item) => Object.keys(item))));

    if (headers.length === 0) {
      return ok("");
    }

    const lines = [
      headers.map((header) => formatCsvValue(header, delimiter)).join(delimiter),
      ...objects.map((item) => headers.map((header) => formatCsvValue(item[header], delimiter)).join(delimiter)),
    ];

    return ok(lines.join("\n"));
  } catch {
    return fail("Enter valid JSON.");
  }
}
