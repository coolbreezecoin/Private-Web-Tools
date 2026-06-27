export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingMinutes: number;
}

const latinWordPattern = /[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?/gu;
const cjkCharacterPattern = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;
const sentencePattern = /[^.!?。！？\n]+[.!?。！？]+|[^.!?。！？\n]+$/gu;

export function getTextStats(text: string): TextStats {
  const latinWords = text.match(latinWordPattern) ?? [];
  const cjkCharacters = text.match(cjkCharacterPattern) ?? [];
  const words = latinWords.length + cjkCharacters.length;
  const sentences = text.match(sentencePattern)?.filter((item) => item.trim()) ?? [];
  const paragraphs = text.split(/\n{2,}/).filter((item) => item.trim());
  const characters = [...text].length;

  return {
    words,
    characters,
    charactersNoSpaces: [...text.replace(/\s/g, "")].length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    lines: text ? text.split(/\n/).length : 0,
    readingMinutes: words === 0 ? 0 : Math.max(1, Math.ceil(words / 200)),
  };
}
