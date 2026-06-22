/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_ANALYTICS_PROVIDER?: "none" | "cloudflare";
  readonly PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN?: string;
  readonly PUBLIC_ADS_ENABLED?: string;
  readonly PUBLIC_ADS_PROVIDER?: string;
  readonly PUBLIC_ADS_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
