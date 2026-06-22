export interface ConversionResult {
  value: string;
  error: string;
}

function ok(value: string): ConversionResult {
  return { value, error: "" };
}

function fail(error: string): ConversionResult {
  return { value: "", error };
}

function bytesToBinary(bytes: Uint8Array) {
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return binary;
}

export function base64Encode(input: string): ConversionResult {
  const bytes = new TextEncoder().encode(input);
  return ok(btoa(bytesToBinary(bytes)));
}

export function base64Decode(input: string): ConversionResult {
  try {
    const binary = atob(input.trim());
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const value = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return ok(value);
  } catch {
    return fail("Enter valid Base64 text to decode.");
  }
}

export function urlEncode(input: string): ConversionResult {
  try {
    return ok(encodeURIComponent(input));
  } catch {
    return fail("This text cannot be URL encoded.");
  }
}

export function urlDecode(input: string): ConversionResult {
  try {
    return ok(decodeURIComponent(input));
  } catch {
    return fail("Enter a valid URL-encoded string to decode.");
  }
}
