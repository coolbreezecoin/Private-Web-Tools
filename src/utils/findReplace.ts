export type FindReplaceMode = "plain" | "regex";

export interface FindReplaceOptions {
  mode: FindReplaceMode;
  caseInsensitive?: boolean;
  wholeWord?: boolean;
}

export interface FindReplaceResult {
  output: string;
  count: number;
  error: string;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function findReplace(
  text: string,
  find: string,
  replace: string,
  { mode, caseInsensitive = false, wholeWord = false }: FindReplaceOptions,
): FindReplaceResult {
  if (!find) {
    return { output: text, count: 0, error: "" };
  }

  let pattern: RegExp;

  try {
    const flags = caseInsensitive ? "gi" : "g";
    if (mode === "regex") {
      pattern = new RegExp(find, flags);
    } else {
      const source = escapeRegExp(find);
      pattern = new RegExp(wholeWord ? `\\b${source}\\b` : source, flags);
    }
  } catch (error) {
    return { output: text, count: 0, error: error instanceof Error ? error.message : "Invalid pattern." };
  }

  let count = 0;
  const output = text.replace(pattern, () => {
    count += 1;
    return replace;
  });

  return { output, count, error: "" };
}
