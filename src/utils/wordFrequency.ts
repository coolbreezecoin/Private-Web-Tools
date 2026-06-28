export interface WordFrequencyOptions {
  caseInsensitive?: boolean;
  minLength?: number;
  ignoreStopwords?: boolean;
}

export interface WordFrequencyItem {
  word: string;
  count: number;
  percent: number;
}

const wordPattern = /\p{L}[\p{L}\p{N}']*/gu;

const stopwords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "has",
  "have",
  "he",
  "her",
  "his",
  "i",
  "in",
  "is",
  "it",
  "its",
  "not",
  "of",
  "on",
  "or",
  "she",
  "that",
  "the",
  "their",
  "they",
  "this",
  "to",
  "was",
  "we",
  "were",
  "with",
  "you",
  "your",
]);

export function wordFrequency(text: string, options: WordFrequencyOptions = {}): WordFrequencyItem[] {
  const minLength = Math.max(1, Math.floor(options.minLength ?? 1));
  const counts = new Map<string, number>();
  const matches = text.match(wordPattern) ?? [];
  let total = 0;

  for (const match of matches) {
    const word = options.caseInsensitive ? match.toLocaleLowerCase() : match;
    if (word.length < minLength) continue;
    if (options.ignoreStopwords && stopwords.has(word.toLocaleLowerCase())) continue;

    counts.set(word, (counts.get(word) ?? 0) + 1);
    total += 1;
  }

  if (total === 0) return [];

  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count, percent: (count / total) * 100 }))
    .sort((left, right) => right.count - left.count || left.word.localeCompare(right.word));
}
