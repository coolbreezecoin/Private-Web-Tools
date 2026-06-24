export interface EntityConversionResult {
  value: string;
  error: string;
}

const namedEntities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  "#39": "'",
  nbsp: "\u00a0",
  copy: "\u00a9",
  reg: "\u00ae",
  trade: "\u2122",
  hellip: "\u2026",
  ndash: "\u2013",
  mdash: "\u2014",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201c",
  rdquo: "\u201d",
};

function encodeCodePoint(codePoint: number) {
  return `&#${codePoint};`;
}

export function encode(text: string, { nonAscii }: { nonAscii: boolean }): EntityConversionResult {
  let value = "";

  for (const character of text) {
    const codePoint = character.codePointAt(0) ?? 0;

    if (character === "&") value += "&amp;";
    else if (character === "<") value += "&lt;";
    else if (character === ">") value += "&gt;";
    else if (character === '"') value += "&quot;";
    else if (character === "'") value += "&#39;";
    else if (nonAscii && codePoint > 0x7f) value += encodeCodePoint(codePoint);
    else value += character;
  }

  return { value, error: "" };
}

export function decode(text: string): EntityConversionResult {
  const value = text.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]+);/g, (match, entity: string) => {
    if (entity.startsWith("#x")) {
      const codePoint = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    }

    if (entity.startsWith("#")) {
      const codePoint = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    }

    return namedEntities[entity] ?? match;
  });

  return { value, error: "" };
}
