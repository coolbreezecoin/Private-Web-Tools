export interface WhitespaceOptions {
  collapseSpaces?: boolean;
  removeLineBreaks?: boolean;
  removeBlankLines?: boolean;
  removeTabs?: boolean;
  trimLines?: boolean;
  trim?: boolean;
}

function normalizeLineBreaks(text: string) {
  return text.replace(/\r\n?/g, "\n");
}

export function collapseSpaces(text: string) {
  return text.replace(/ {2,}/g, " ");
}

export function removeLineBreaks(text: string) {
  return normalizeLineBreaks(text).split("\n").join(" ");
}

export function removeBlankLines(text: string) {
  return normalizeLineBreaks(text)
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .join("\n");
}

export function removeTabs(text: string) {
  return text.replace(/\t+/g, "");
}

export function trimLines(text: string) {
  return normalizeLineBreaks(text)
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
}

export function cleanText(text: string, options: WhitespaceOptions) {
  let output = normalizeLineBreaks(text);

  if (options.removeTabs) output = removeTabs(output);
  if (options.trimLines) output = trimLines(output);
  if (options.removeBlankLines) output = removeBlankLines(output);
  if (options.removeLineBreaks) output = removeLineBreaks(output);
  if (options.collapseSpaces) output = collapseSpaces(output);
  if (options.trim) output = output.trim();

  return output;
}
