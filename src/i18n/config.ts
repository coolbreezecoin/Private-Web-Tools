// Phase 1 ships en + zh. Re-add "es", "fr", "de" here (and their localeNames
// entry) once their content in src/i18n/content/*.ts is translated.
export const locales = ["en", "zh"] as const;
export const defaultLocale = "en";

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  zh: "中文",
};

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function localizePath(path: string, locale: Locale) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return normalized;
  return normalized === "/" ? `/${locale}/` : `/${locale}${normalized}`;
}

export function stripLocale(pathname: string): { locale: Locale; basePath: string } {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const [firstSegment = ""] = normalized.split("/").filter(Boolean);

  if (isLocale(firstSegment)) {
    const basePath = normalized.replace(`/${firstSegment}`, "") || "/";
    return { locale: firstSegment, basePath };
  }

  return { locale: defaultLocale, basePath: normalized || "/" };
}
