// Enabled locales. Astro i18n, hreflang alternates, sitemap entries, and the
// language switcher all derive from this list.
export const locales = ["en", "zh", "es", "fr", "de"] as const;
export const defaultLocale = "en";

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
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
