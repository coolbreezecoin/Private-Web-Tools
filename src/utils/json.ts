export interface JsonResult {
  value: string;
  error: string;
}

export type JsonIndent = 2 | 4 | "\t";

function parseJson(input: string): { data: unknown; error: string } {
  try {
    return { data: JSON.parse(input), error: "" };
  } catch (error) {
    return { data: undefined, error: error instanceof Error ? error.message : "Unable to parse JSON." };
  }
}

export function formatJson(input: string, indent: JsonIndent): JsonResult {
  if (!input.trim()) {
    return { value: "", error: "" };
  }

  const parsed = parseJson(input);
  if (parsed.error) {
    return { value: "", error: parsed.error };
  }

  return { value: JSON.stringify(parsed.data, null, indent), error: "" };
}

export function minifyJson(input: string): JsonResult {
  if (!input.trim()) {
    return { value: "", error: "" };
  }

  const parsed = parseJson(input);
  if (parsed.error) {
    return { value: "", error: parsed.error };
  }

  return { value: JSON.stringify(parsed.data), error: "" };
}
