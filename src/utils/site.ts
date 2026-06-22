export const siteName = "Toolkit";
export const siteUrl = import.meta.env.SITE || "https://example.com";

export function toAbsoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}
