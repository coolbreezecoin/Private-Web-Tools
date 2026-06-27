export interface UrlParam {
  id: number;
  key: string;
  value: string;
}

export interface ParsedUrl {
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  params: UrlParam[];
  href: string;
}

export interface UrlParseResult {
  value: ParsedUrl | null;
  error: string;
}

export function parseUrl(input: string, base = ""): UrlParseResult {
  if (!input.trim()) {
    return { value: null, error: "Enter a URL." };
  }

  try {
    const url = base.trim() ? new URL(input, base) : new URL(input);
    return {
      value: {
        protocol: url.protocol,
        host: url.host,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        origin: url.origin,
        params: Array.from(url.searchParams.entries()).map(([key, value], index) => ({ id: index + 1, key, value })),
        href: url.href,
      },
      error: "",
    };
  } catch {
    return { value: null, error: "Invalid URL." };
  }
}

export function buildUrl(source: ParsedUrl, params: UrlParam[]): string {
  const url = new URL(source.href);
  url.search = "";

  for (const param of params) {
    if (param.key) {
      url.searchParams.append(param.key, param.value);
    }
  }

  return url.href;
}
