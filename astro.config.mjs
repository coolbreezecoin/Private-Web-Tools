import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import { tools } from "./src/data/tools";

const site = process.env.SITE_URL || "https://example.com";
const alwaysIncluded = ["/", "/about", "/privacy", "/all-tools"];
const allowedSitemapPathnames = new Set(alwaysIncluded);

for (const tool of tools) {
  if (!tool.visibility.sitemap) continue;

  allowedSitemapPathnames.add(tool.seo.path);
  for (const landing of tool.landingPages) {
    allowedSitemapPathnames.add(landing.seo.path);
  }
}

function normalizePathname(page) {
  return new URL(page).pathname.replace(/\/$/, "") || "/";
}

export default defineConfig({
  site,
  output: "static",
  integrations: [
    svelte(),
    sitemap({
      filter: (page) => allowedSitemapPathnames.has(normalizePathname(page)),
    }),
  ],
});
