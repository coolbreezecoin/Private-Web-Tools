export interface RegexMatchGroup {
  label: string;
  value: string;
}

export interface RegexMatch {
  value: string;
  index: number;
  end: number;
  groups: RegexMatchGroup[];
}

export interface RegexTestResult {
  matches: RegexMatch[];
  replacement: string;
  error: string;
}

function ensureIterableFlags(flags: string) {
  return flags.includes("g") || flags.includes("y") ? flags : `${flags}g`;
}

export function testRegex(pattern: string, flags: string, testString: string, replacement: string): RegexTestResult {
  if (!pattern) {
    return { matches: [], replacement: testString, error: "" };
  }

  try {
    // Pathological patterns can still hang the user's own browser tab; there is no server impact because testing is client-side.
    const matcher = new RegExp(pattern, ensureIterableFlags(flags));
    const replacer = new RegExp(pattern, flags);
    const matches: RegexMatch[] = [];
    let match: RegExpExecArray | null;

    while ((match = matcher.exec(testString))) {
      const value = match[0];
      const indexedGroups = match.slice(1).map((group, index) => ({
        label: String(index + 1),
        value: group ?? "",
      }));
      const namedGroups = Object.entries(match.groups ?? {}).map(([label, group]) => ({
        label,
        value: group ?? "",
      }));

      matches.push({
        value,
        index: match.index,
        end: match.index + value.length,
        groups: [...indexedGroups, ...namedGroups],
      });

      if (value === "") matcher.lastIndex += 1;
    }

    return {
      matches,
      replacement: replacement ? testString.replace(replacer, replacement) : "",
      error: "",
    };
  } catch (error) {
    return {
      matches: [],
      replacement: "",
      error: error instanceof Error ? error.message : "Invalid regular expression.",
    };
  }
}
