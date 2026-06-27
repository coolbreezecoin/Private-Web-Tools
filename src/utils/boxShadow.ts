export interface BoxShadow {
  inset: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  alpha: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized;

  const value = Number.parseInt(full, 16);
  return {
    red: (value >> 16) & 255,
    green: (value >> 8) & 255,
    blue: value & 255,
  };
}

export function serializeBoxShadow(shadow: BoxShadow): string {
  const color = hexToRgb(shadow.color);
  const alpha = clamp(shadow.alpha, 0, 1);
  const inset = shadow.inset ? " inset" : "";
  return `${shadow.x}px ${shadow.y}px ${Math.max(0, shadow.blur)}px ${shadow.spread}px rgba(${color.red}, ${color.green}, ${color.blue}, ${alpha.toFixed(2)})${inset}`;
}

export function serializeBoxShadows(shadows: BoxShadow[]): string {
  return shadows.length ? shadows.map(serializeBoxShadow).join(", ") : "none";
}
