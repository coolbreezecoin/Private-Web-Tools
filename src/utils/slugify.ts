export interface SlugifyOptions {
  separator?: "-" | "_";
  lowercase?: boolean;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function slugify(text: string, options: SlugifyOptions = {}): string {
  const separator = options.separator ?? "-";
  const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cased = options.lowercase === false ? normalized : normalized.toLocaleLowerCase();
  const safe = cased.replace(/[^a-z0-9]+/gi, separator);
  const repeatedSeparators = new RegExp(`${escapeRegExp(separator)}+`, "g");
  const edgeSeparators = new RegExp(`^${escapeRegExp(separator)}|${escapeRegExp(separator)}$`, "g");

  return safe.replace(repeatedSeparators, separator).replace(edgeSeparators, "");
}
