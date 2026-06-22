# Toolkit

Privacy-first online tools built with Astro, TypeScript, and Svelte islands.

The MVP ships a fast, static site with private text tools, including a Fancy Text Generator and a Word & Character Counter. Tool input is processed locally in the browser.

## Stack

- Astro + TypeScript
- Svelte islands for interactive tools
- Plain CSS with design tokens
- Static output for Cloudflare Pages
- `@astrojs/sitemap` for sitemap generation

## Local Development

```bash
npm install
npm run dev
```

Open the local URL printed by Astro.

## Quality Checks

```bash
npm run check
npm run build
```

`npm run build` runs `astro check` and then generates the static site in `dist/`.

## Environment Variables

Copy `.env.example` to `.env` for local configuration.

```bash
SITE_URL=https://example.com
PUBLIC_ANALYTICS_PROVIDER=none
PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=
PUBLIC_ADS_ENABLED=false
PUBLIC_ADS_PROVIDER=none
PUBLIC_ADS_CLIENT_ID=
```

Notes:

- `SITE_URL` should be the production origin. It is used by Astro for canonical URLs and sitemap generation.
- Ads are disabled by default. When `PUBLIC_ADS_ENABLED=false`, ad slots do not render visible placeholders or load ad scripts.
- Analytics must never record tool input.

## Cloudflare Pages Deployment

1. Push the repository to GitHub.
2. In Cloudflare Pages, create a new project from the GitHub repository.
3. Use these build settings:
   - Framework preset: `Astro`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node.js version: `26` or the current Cloudflare-supported LTS/runtime compatible with the project
4. Add environment variables:
   - `SITE_URL=https://your-domain.example`
   - `PUBLIC_ANALYTICS_PROVIDER=none` or `cloudflare`
   - `PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=...` if Cloudflare Web Analytics is enabled
   - `PUBLIC_ADS_ENABLED=false` until ad approval is complete
5. Deploy.

The `public/_headers` file keeps COOP/COEP headers commented out (reserved for future WASM-heavy tools). On non-Cloudflare hosts this file is ignored; configure headers in the web server instead. Test analytics and ad providers before enabling third-party scripts in production.

## Self-Hosted Deployment (宝塔 / Nginx)

The site is static, so the server only needs to serve the built `dist/` directory.

1. Create the site in 宝塔 via **Git 部署** (SSH repo URL, branch `main`); it clones into the site directory, e.g. `/www/wwwroot/tool.nobrisk.com`.
2. Install Node **>= 22.12** (宝塔 Node 版本管理器) and set it as the command-line version.
3. Set the site **运行目录 (run directory) to `/dist`** so only the build output is served (keeps `.git` and `src/` off the web root).
4. First build: `cd /www/wwwroot/tool.nobrisk.com && SITE_URL=https://tool.nobrisk.com npm run build`.
5. Issue SSL (Let's Encrypt) and force HTTPS.

### Auto-deploy on push

`deploy.sh` (repo root) is the 宝塔 Webhook target: it hard-resets to `origin/main`, runs `npm ci`, and rebuilds with the production `SITE_URL`. It auto-selects an installed Node >= 22 so the webhook shell does not fall back to system Node 18.

- 宝塔 Webhook command: `bash /www/wwwroot/tool.nobrisk.com/deploy.sh`
- Point a GitHub push webhook at the 宝塔 Webhook URL; open the webhook port in the firewall / security group.
- Edit `APP_DIR` / `SITE_URL` in `deploy.sh` if the path or domain differs.

## Project Structure

```text
src/
  components/
    ads/
    content/
    layout/
    tools/
  data/
    tools.ts
  layouts/
  pages/
  styles/
  utils/
public/
  _headers
```

## Adding a Tool

1. Add metadata and SEO content to `src/data/tools.ts`.
2. Add a Svelte island component under `src/components/tools/`.
3. Add an Astro route under `src/pages/`.
4. Include visible HowTo and FAQ content.
5. Run `npm run build` and verify sitemap output.
