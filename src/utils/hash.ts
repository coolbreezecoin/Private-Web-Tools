export type HashAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export const hashAlgorithms: HashAlgorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function generateHash(input: string, algorithm: HashAlgorithm) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest(algorithm, data);
  return toHex(digest);
}

export async function generateHashes(input: string) {
  const entries = await Promise.all(hashAlgorithms.map(async (algorithm) => [algorithm, await generateHash(input, algorithm)] as const));
  return Object.fromEntries(entries) as Record<HashAlgorithm, string>;
}
