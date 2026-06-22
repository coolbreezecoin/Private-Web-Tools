export interface CaseStyle {
  id: string;
  label: string;
  description: string;
  transform: (input: string) => string;
}

const wordPattern = /[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?/g;

function getWords(input: string) {
  return input.match(wordPattern) ?? [];
}

function capitalizeWord(word: string) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function toTitleCase(input: string) {
  return input.toLowerCase().replace(wordPattern, capitalizeWord);
}

function toSentenceCase(input: string) {
  const lower = input.toLowerCase();
  let shouldCapitalize = true;
  let output = "";

  for (const character of lower) {
    if (/[a-z]/.test(character)) {
      output += shouldCapitalize ? character.toUpperCase() : character;
      shouldCapitalize = false;
      continue;
    }

    output += character;
    if (/[.!?\n]/.test(character)) {
      shouldCapitalize = true;
    }
  }

  return output;
}

function toAlternatingCase(input: string) {
  let letterIndex = 0;

  return [...input]
    .map((character) => {
      if (!/[A-Za-z]/.test(character)) return character;

      const transformed = letterIndex % 2 === 0 ? character.toLowerCase() : character.toUpperCase();
      letterIndex += 1;
      return transformed;
    })
    .join("");
}

function toCamelCase(input: string) {
  const words = getWords(input).map((word) => word.toLowerCase());
  return words
    .map((word, index) => (index === 0 ? word : capitalizeWord(word)))
    .join("");
}

function toSeparatedCase(input: string, separator: "_" | "-") {
  return getWords(input)
    .map((word) => word.toLowerCase())
    .join(separator);
}

export const caseStyles: CaseStyle[] = [
  {
    id: "uppercase",
    label: "UPPERCASE",
    description: "Convert every supported letter to capitals.",
    transform: (input) => input.toUpperCase(),
  },
  {
    id: "lowercase",
    label: "lowercase",
    description: "Convert every supported letter to lowercase.",
    transform: (input) => input.toLowerCase(),
  },
  {
    id: "title-case",
    label: "Title Case",
    description: "Capitalize the first letter of each word.",
    transform: toTitleCase,
  },
  {
    id: "sentence-case",
    label: "Sentence case",
    description: "Capitalize sentence starts and lowercase the rest.",
    transform: toSentenceCase,
  },
  {
    id: "alternating-case",
    label: "aLtErNaTiNg cAsE",
    description: "Alternate lowercase and uppercase letters.",
    transform: toAlternatingCase,
  },
  {
    id: "camel-case",
    label: "camelCase",
    description: "Remove spaces and capitalize each word after the first.",
    transform: toCamelCase,
  },
  {
    id: "snake-case",
    label: "snake_case",
    description: "Join lowercase words with underscores.",
    transform: (input) => toSeparatedCase(input, "_"),
  },
  {
    id: "kebab-case",
    label: "kebab-case",
    description: "Join lowercase words with hyphens.",
    transform: (input) => toSeparatedCase(input, "-"),
  },
];
