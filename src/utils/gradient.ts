export type GradientType = "linear" | "radial";

export interface GradientStop {
  color: string;
  position: number;
}

export interface GradientState {
  type: GradientType;
  angle: number;
  stops: GradientStop[];
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function buildGradientCss(state: GradientState): string {
  const stops = state.stops
    .slice(0, Math.max(2, state.stops.length))
    .map((stop) => `${stop.color} ${clampPercent(stop.position)}%`)
    .join(", ");

  if (state.type === "radial") {
    return `radial-gradient(circle, ${stops})`;
  }

  const angle = Math.min(360, Math.max(0, Math.round(state.angle)));
  return `linear-gradient(${angle}deg, ${stops})`;
}
