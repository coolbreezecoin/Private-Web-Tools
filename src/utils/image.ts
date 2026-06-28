export type ImageOutputFormat = "png" | "jpeg" | "webp";

export interface ResizeOptions {
  targetW?: number;
  targetH?: number;
  percent?: number;
  lockAspect?: boolean;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropBounds {
  width: number;
  height: number;
}

function positiveInteger(value: number, fallback: number) {
  if (!Number.isFinite(value)) return Math.max(1, Math.round(fallback));
  return Math.max(1, Math.round(value));
}

export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = n;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const precision = unitIndex === 0 || value >= 10 ? 0 : 1;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
}

export function computeResizeDimensions(srcW: number, srcH: number, options: ResizeOptions): { width: number; height: number } {
  const sourceWidth = positiveInteger(srcW, 1);
  const sourceHeight = positiveInteger(srcH, 1);
  const aspect = sourceWidth / sourceHeight;

  if (options.percent !== undefined) {
    const scale = Math.max(1, options.percent) / 100;
    return {
      width: positiveInteger(sourceWidth * scale, sourceWidth),
      height: positiveInteger(sourceHeight * scale, sourceHeight),
    };
  }

  const requestedWidth = options.targetW ? positiveInteger(options.targetW, sourceWidth) : undefined;
  const requestedHeight = options.targetH ? positiveInteger(options.targetH, sourceHeight) : undefined;

  if (options.lockAspect) {
    if (requestedWidth) {
      return { width: requestedWidth, height: positiveInteger(requestedWidth / aspect, sourceHeight) };
    }
    if (requestedHeight) {
      return { width: positiveInteger(requestedHeight * aspect, sourceWidth), height: requestedHeight };
    }
  }

  return {
    width: requestedWidth ?? sourceWidth,
    height: requestedHeight ?? sourceHeight,
  };
}

export function clampCropRect(rect: CropRect, bounds: CropBounds): CropRect {
  const boundWidth = positiveInteger(bounds.width, 1);
  const boundHeight = positiveInteger(bounds.height, 1);
  const width = Math.min(positiveInteger(rect.width, 1), boundWidth);
  const height = Math.min(positiveInteger(rect.height, 1), boundHeight);
  const x = Math.min(Math.max(0, Math.round(rect.x)), boundWidth - width);
  const y = Math.min(Math.max(0, Math.round(rect.y)), boundHeight - height);

  return { x, y, width, height };
}

export function getOutputMime(format: ImageOutputFormat): string {
  if (format === "jpeg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  return "image/png";
}
