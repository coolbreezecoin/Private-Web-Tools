export interface TextStyle {
  id: string;
  label: string;
  description: string;
  transform: (input: string) => string;
}

const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lower = "abcdefghijklmnopqrstuvwxyz";
const digits = "0123456789";

function fromCodePointRange(input: string, upperStart?: number, lowerStart?: number, digitStart?: number) {
  return [...input]
    .map((char) => {
      const upperIndex = upper.indexOf(char);
      if (upperIndex >= 0 && upperStart) return String.fromCodePoint(upperStart + upperIndex);

      const lowerIndex = lower.indexOf(char);
      if (lowerIndex >= 0 && lowerStart) return String.fromCodePoint(lowerStart + lowerIndex);

      const digitIndex = digits.indexOf(char);
      if (digitIndex >= 0 && digitStart) return String.fromCodePoint(digitStart + digitIndex);

      return char;
    })
    .join("");
}

function fromArrays(input: string, upperMap: string[], lowerMap: string[], digitMap?: string[]) {
  return [...input]
    .map((char) => {
      const upperIndex = upper.indexOf(char);
      if (upperIndex >= 0) return upperMap[upperIndex] ?? char;

      const lowerIndex = lower.indexOf(char);
      if (lowerIndex >= 0) return lowerMap[lowerIndex] ?? char;

      const digitIndex = digits.indexOf(char);
      if (digitIndex >= 0 && digitMap) return digitMap[digitIndex] ?? char;

      return char;
    })
    .join("");
}

function strikethrough(input: string) {
  return [...input].map((char) => (char === " " ? char : `${char}\u0336`)).join("");
}

function zalgo(input: string) {
  const up = ["\u030d", "\u030e", "\u0304", "\u0305", "\u033f", "\u0311"];
  const down = ["\u0316", "\u0317", "\u0318", "\u0319", "\u0324", "\u0325"];
  const mid = ["\u0334", "\u0335", "\u0336"];

  return [...input.slice(0, 160)]
    .map((char, index) => {
      if (char.trim() === "") return char;
      return `${char}${up[index % up.length]}${mid[index % mid.length]}${down[index % down.length]}`;
    })
    .join("");
}

const scriptUpper = [..."𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵"];
const scriptLower = [..."𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏"];
const bubbleUpper = [..."ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ"];
const bubbleLower = [..."ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ"];
const bubbleDigits = [..."⓪①②③④⑤⑥⑦⑧⑨"];
const squareUpper = [..."🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉"];
const squareLower = squareUpper;
const smallCapsLower = [..."ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ"];

export const textStyles: TextStyle[] = [
  {
    id: "bold",
    label: "Bold",
    description: "Strong Unicode text for bios, captions, and comments.",
    transform: (input) => fromCodePointRange(input, 0x1d400, 0x1d41a, 0x1d7ce),
  },
  {
    id: "italic",
    label: "Italic",
    description: "Slanted Unicode text for subtle emphasis.",
    transform: (input) => fromCodePointRange(input, 0x1d434, 0x1d44e),
  },
  {
    id: "boldItalic",
    label: "Bold Italic",
    description: "A stronger slanted style for short phrases.",
    transform: (input) => fromCodePointRange(input, 0x1d468, 0x1d482),
  },
  {
    id: "script",
    label: "Script / Cursive",
    description: "Decorative cursive-style Unicode text.",
    transform: (input) => fromArrays(input, scriptUpper, scriptLower),
  },
  {
    id: "monospace",
    label: "Monospace",
    description: "Code-like fixed-width Unicode letters.",
    transform: (input) => fromCodePointRange(input, 0x1d670, 0x1d68a, 0x1d7f6),
  },
  {
    id: "bubble",
    label: "Bubble",
    description: "Circled letters and numbers for playful text.",
    transform: (input) => fromArrays(input, bubbleUpper, bubbleLower, bubbleDigits),
  },
  {
    id: "square",
    label: "Square",
    description: "Boxed uppercase-style characters for names and labels.",
    transform: (input) => fromArrays(input.toUpperCase(), squareUpper, squareLower),
  },
  {
    id: "strikethrough",
    label: "Strikethrough",
    description: "Crossed-out text for jokes, edits, and emphasis.",
    transform: strikethrough,
  },
  {
    id: "smallCaps",
    label: "Small Caps",
    description: "Compact uppercase-looking letters.",
    transform: (input) => fromArrays(input.toLowerCase(), upper.split(""), smallCapsLower),
  },
  {
    id: "zalgo",
    label: "Zalgo",
    description: "Glitchy text with controlled combining marks.",
    transform: zalgo,
  },
];

export function orderStyles(featuredStyles: string[] = []) {
  const featured = textStyles.filter((style) => featuredStyles.includes(style.id));
  const rest = textStyles.filter((style) => !featuredStyles.includes(style.id));
  return [...featured, ...rest];
}
