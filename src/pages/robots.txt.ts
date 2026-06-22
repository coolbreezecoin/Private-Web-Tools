import type { APIRoute } from "astro";
import { toAbsoluteUrl } from "@/utils/site";

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${toAbsoluteUrl("/sitemap-index.xml")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
