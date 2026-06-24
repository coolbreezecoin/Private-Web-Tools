export interface UuidOptions {
  uppercase: boolean;
}

function normalizeCount(count: number) {
  return Math.min(50, Math.max(1, Math.round(Number.isFinite(count) ? count : 1)));
}

export function generateUuids(count: number, { uppercase }: UuidOptions) {
  return Array.from({ length: normalizeCount(count) }, () => {
    const uuid = crypto.randomUUID();
    return uppercase ? uuid.toUpperCase() : uuid;
  });
}
