export type SupportedBase = 2 | 8 | 10 | 16;

export interface NumberBaseResult {
  binary: string;
  octal: string;
  decimal: string;
  hex: string;
}

export interface NumberBaseConversionResult {
  value: NumberBaseResult | null;
  error: string;
}

const digitPatternByBase: Record<SupportedBase, RegExp> = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-fA-F]+$/,
};

function digitValue(character: string): bigint {
  const code = character.toLowerCase().charCodeAt(0);
  if (code >= 48 && code <= 57) return BigInt(code - 48);
  return BigInt(code - 87);
}

export function convertNumberBase(input: string, sourceBase: SupportedBase): NumberBaseConversionResult {
  const trimmed = input.trim();
  const sign = trimmed.startsWith("-") ? -1n : 1n;
  const digits = trimmed.startsWith("-") ? trimmed.slice(1) : trimmed;

  if (!digits || !digitPatternByBase[sourceBase].test(digits)) {
    return { value: null, error: "Invalid digits for the selected base." };
  }

  let value = 0n;
  const base = BigInt(sourceBase);

  for (const character of digits) {
    value = value * base + digitValue(character);
  }

  value *= sign;

  return {
    value: {
      binary: value.toString(2),
      octal: value.toString(8),
      decimal: value.toString(10),
      hex: value.toString(16),
    },
    error: "",
  };
}
