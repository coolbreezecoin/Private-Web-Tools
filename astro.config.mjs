import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import { tools } from "./src/data/tools";
import { defaultLocale, locales, stripLocale } from "./src/i18n/config";

const site = process.env.SITE_URL || "https://example.com";
const alwaysIncluded = ["/", "/about", "/privacy", "/all-tools", "/text-tools", "/image-tools", "/converter-tools", "/utility-tools", "/calculators"];
const allowedSitemapPathnames = new Set(alwaysIncluded);
const sitemapLocales = Object.fromEntries(locales.map((locale) => [locale, locale]));

for (const tool of tools) {
  if (!tool.visibility.sitemap) continue;

  allowedSitemapPathnames.add(tool.route);
  for (const landing of tool.landingPages) {
    allowedSitemapPathnames.add(landing.route);
  }
}

function normalizePathname(page) {
  const pathname = new URL(page).pathname.replace(/\/$/, "") || "/";
  return stripLocale(pathname).basePath.replace(/\/$/, "") || "/";
}

export default defineConfig({
  site,
  output: "static",
  i18n: {
    defaultLocale,
    locales: [...locales],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    svelte(),
    sitemap({
      i18n: {
        defaultLocale,
        locales: sitemapLocales,
      },
      filter: (page) => allowedSitemapPathnames.has(normalizePathname(page)),
    }),
  ],
});
