export type LoremUnit = "paragraphs" | "sentences" | "words";

export interface LoremOptions {
  count: number;
  unit: LoremUnit;
  startWithLorem: boolean;
}

const openingWords = ["Lorem", "ipsum", "dolor", "sit", "amet"];

const wordBank = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
];

function normalizedCount(count: number, unit: LoremUnit) {
  const max = unit === "paragraphs" ? 20 : unit === "sentences" ? 80 : 500;
  return Math.min(max, Math.max(1, Math.round(Number.isFinite(count) ? count : 1)));
}

function wordAt(index: number, startWithLorem: boolean) {
  if (startWithLorem && index < openingWords.length) {
    return openingWords[index];
  }

  const bankIndex = startWithLorem ? index - openingWords.length : index;
  return wordBank[((bankIndex % wordBank.length) + wordBank.length) % wordBank.length];
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function createSentence(startIndex: number, startWithLorem: boolean, length = 12) {
  const words = Array.from({ length }, (_, index) => wordAt(startIndex + index, startWithLorem).toLowerCase());
  words[0] = capitalize(words[0]);
  return `${words.join(" ")}.`;
}

export function generateLoremIpsum({ count, unit, startWithLorem }: LoremOptions) {
  const safeCount = normalizedCount(count, unit);

  if (unit === "words") {
    return Array.from({ length: safeCount }, (_, index) => wordAt(index, startWithLorem)).join(" ");
  }

  if (unit === "sentences") {
    return Array.from({ length: safeCount }, (_, index) => createSentence(index * 12, startWithLorem && index === 0)).join(" ");
  }

  return Array.from({ length: safeCount }, (_, paragraphIndex) => {
    const sentenceCount = 4 + (paragraphIndex % 2);
    return Array.from({ length: sentenceCount }, (_, sentenceIndex) =>
      createSentence((paragraphIndex * 5 + sentenceIndex) * 12, startWithLorem && paragraphIndex === 0 && sentenceIndex === 0),
    ).join(" ");
  }).join("\n\n");
}
