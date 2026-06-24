export interface ConvertedColor {
  hex: string;
  rgb: string;
  hsl: string;
}

export interface ColorResult {
  value?: ConvertedColor;
  error?: string;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value);
}

function normalizeHue(value: number) {
  return ((value % 360) + 360) % 360;
}

export function rgbToHex({ r, g, b }: RGB) {
  return `#${[r, g, b].map((part) => clamp(round(part), 0, 255).toString(16).padStart(2, "0")).join("")}`;
}

export function hexToRgb(input: string): RGB | null {
  const match = input.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return null;

  const value =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((character) => character + character)
          .join("")
      : match[1];

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const red = clamp(r, 0, 255) / 255;
  const green = clamp(g, 0, 255) / 255;
  const blue = clamp(b, 0, 255) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { h: 0, s: 0, l: round(lightness * 100) };
  }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;

  if (max === red) {
    hue = 60 * (((green - blue) / delta) % 6);
  } else if (max === green) {
    hue = 60 * ((blue - red) / delta + 2);
  } else {
    hue = 60 * ((red - green) / delta + 4);
  }

  return {
    h: round(normalizeHue(hue)),
    s: round(saturation * 100),
    l: round(lightness * 100),
  };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hue = normalizeHue(h);
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = lightness - chroma / 2;

  const [red, green, blue] =
    hue < 60
      ? [chroma, x, 0]
      : hue < 120
        ? [x, chroma, 0]
        : hue < 180
          ? [0, chroma, x]
          : hue < 240
            ? [0, x, chroma]
            : hue < 300
              ? [x, 0, chroma]
              : [chroma, 0, x];

  return {
    r: round((red + match) * 255),
    g: round((green + match) * 255),
    b: round((blue + match) * 255),
  };
}

function parseFunctionParts(input: string, name: "rgb" | "hsl") {
  const match = input.trim().match(new RegExp(`^${name}a?\\((.+)\\)$`, "i"));
  if (!match) return null;

  return match[1]
    .trim()
    .replace(/\s*\/\s*/g, " ")
    .split(/[,\s]+/)
    .filter(Boolean);
}

function parseRgb(input: string): RGB | null {
  const parts = parseFunctionParts(input, "rgb");
  if (!parts || parts.length < 3) return null;

  const [r, g, b] = parts.slice(0, 3).map((part) => Number.parseFloat(part));
  if (![r, g, b].every(Number.isFinite)) return null;
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) return null;

  return { r: round(r), g: round(g), b: round(b) };
}

function parseHsl(input: string): HSL | null {
  const parts = parseFunctionParts(input, "hsl");
  if (!parts || parts.length < 3) return null;

  const h = Number.parseFloat(parts[0]);
  const s = Number.parseFloat(parts[1].replace("%", ""));
  const l = Number.parseFloat(parts[2].replace("%", ""));
  if (![h, s, l].every(Number.isFinite)) return null;
  if (s < 0 || s > 100 || l < 0 || l > 100) return null;

  return { h, s, l };
}

function formatRgb({ r, g, b }: RGB) {
  return `rgb(${round(r)}, ${round(g)}, ${round(b)})`;
}

function formatHsl({ h, s, l }: HSL) {
  return `hsl(${round(h)}, ${round(s)}%, ${round(l)}%)`;
}

export function convertColor(input: string): ColorResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { error: "Empty color value." };
  }

  const rgb = hexToRgb(trimmed) ?? parseRgb(trimmed) ?? (parseHsl(trimmed) ? hslToRgb(parseHsl(trimmed) as HSL) : null);
  if (!rgb) {
    return { error: "Unsupported color value." };
  }

  const hsl = rgbToHsl(rgb);

  return {
    value: {
      hex: rgbToHex(rgb),
      rgb: formatRgb(rgb),
      hsl: formatHsl(hsl),
    },
  };
}
