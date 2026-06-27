import type { Locale } from "./config";
import { en } from "./content/en";
import { zh } from "./content/zh";
import { es } from "./content/es";
import { fr } from "./content/fr";
import { de } from "./content/de";
import type { FAQItem, HowToStep } from "@/data/tools";

const localizedContent = {
  en,
  zh,
  es,
  fr,
  de,
} as const;

export interface ToolContent {
  name: string;
  shortName: string;
  description: string;
  privacyNote: string;
  hero: string;
  bodyTitle?: string;
  body?: string[];
  seo: {
    title: string;
    description: string;
  };
  howTo: HowToStep[];
  faq: FAQItem[];
}

export interface LandingContent {
  keyword: string;
  h1: string;
  intro: string;
  body: string[];
  seo: {
    title: string;
    description: string;
  };
  howTo: HowToStep[];
  faq: FAQItem[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override === undefined ? base : override) as T;
  }

  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    merged[key] = key in merged ? deepMerge(merged[key], value) : value;
  }

  return merged as T;
}

export function getToolContent(id: string, locale: Locale): ToolContent {
  const fallback = en.tools[id as keyof typeof en.tools];
  if (!fallback) {
    throw new Error(`Missing English content for tool: ${id}`);
  }

  const localeTools = localizedContent[locale].tools as Record<string, unknown>;
  return deepMerge(fallback, localeTools[id]) as unknown as ToolContent;
}

export function getLandingContent(toolId: string, slug: string, locale: Locale): LandingContent {
  const key = `${toolId}/${slug}` as keyof typeof en.landings;
  const fallback = en.landings[key];
  if (!fallback) {
    throw new Error(`Missing English content for landing: ${key}`);
  }

  const localeLandings = localizedContent[locale].landings as Record<string, unknown>;
  return deepMerge(fallback, localeLandings[key as string]) as unknown as LandingContent;
}
