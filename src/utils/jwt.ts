export interface JwtDecodeResult {
  header?: unknown;
  payload?: unknown;
  error?: string;
}

function decodeBase64Url(segment: string) {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function parseSegment(segment: string) {
  return JSON.parse(decodeBase64Url(segment));
}

export function decodeJwt(token: string): JwtDecodeResult {
  const segments = token.trim().split(".");
  if (segments.length < 2 || !segments[0] || !segments[1]) {
    return { error: "Token must include header and payload segments." };
  }

  try {
    return {
      header: parseSegment(segments[0]),
      payload: parseSegment(segments[1]),
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to decode JWT." };
  }
}

export function getUnixClaimDate(payload: unknown, claim: "exp" | "iat" | "nbf") {
  if (!payload || typeof payload !== "object" || !(claim in payload)) return "";
  const value = (payload as Record<string, unknown>)[claim];
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  return new Date(value * 1000).toLocaleString();
}
