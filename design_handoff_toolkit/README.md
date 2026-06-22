# Handoff: Toolkit — Privacy-first online tools site

## Overview
Toolkit is a browser-based utilities site for mainstream / social-media users (Instagram & TikTok bio styling, image compression, file conversion, etc.). **All processing runs locally in the browser — nothing is uploaded.** The product is ad-supported but must feel clean, trustworthy, and premium (Linear/Vercel polish, but warmer and friendlier). All UI copy is in **English**.

This bundle currently contains the **homepage / tool directory**. The Fancy Text tool page, the file-tool template variant, and mobile screens are in progress and will be added to this package as they're finished.

## About the Design Files
The file in this bundle (`Toolkit Home.dc.html`) is a **design reference created in HTML** — a high-fidelity prototype showing intended look and behavior, **not production code to copy directly**. It is authored in a small in-house "Design Component" runtime (an `<x-dc>` template + a `Component` logic class), so don't lift the markup verbatim.

Your task is to **recreate this design in the target codebase's existing environment** (React, Vue, Svelte, etc.) using its established component patterns, and to read the design tokens / measurements below as the source of truth. If no frontend environment exists yet, pick the most appropriate modern stack (e.g. React + Tailwind or CSS variables) and implement there.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, and interactions are specified below and should be reproduced precisely. Recreate pixel-for-pixel using the codebase's own primitives.

---

## Design Tokens

### Color — Light theme (default when `prefers-color-scheme: light`)
| Token | Hex | Use |
|---|---|---|
| `bg` | `#faf9f7` | Page background (warm off-white) |
| `surface` | `#ffffff` | Cards, inputs, header |
| `text` | `#1c1b1a` | Primary text |
| `muted` | `#6f6b64` | Secondary text, nav links |
| `border` | `#ebe9e4` | Card / divider borders |
| `accent` | `#4f46e5` | CTAs, active state, focus, links |
| `accent-glow` | `rgba(79,70,229,.32)` | Logo / button shadow |
| `accent-soft-bg` | `#eef0ff` | Trust pill, icon tiles, badges (bg) |
| `accent-soft-border` | `#dfe2ff` | Trust pill border |
| `accent-soft-text` | `#4338ca` | Text on soft-accent surfaces |
| `input-border` | `#e2e0db` | Input outline |
| `strip-bg` / `ad-bg` | `#f4f3f0` | Trust strip + ad placeholder bg |
| `ad-border` | `#dedcd6` | Ad placeholder dashed border |
| `ad-text` | `#9a958c` | Ad label text |
| `nav-hover` | `#f0eeea` | Nav link hover bg |

### Color — Dark theme (default when `prefers-color-scheme: dark`)
| Token | Hex |
|---|---|
| `bg` | `#141318` |
| `surface` | `#1d1c23` |
| `text` | `#f5f4f1` |
| `muted` | `#9d9aa8` |
| `border` | `#2c2b34` |
| `accent` | `#7c83ff` |
| `accent-glow` | `rgba(124,131,255,.35)` |
| `accent-soft-bg` | `#211f2e` |
| `accent-soft-border` | `#34324a` |
| `accent-soft-text` | `#c7c4d9` |
| `input-border` | `#34323d` |
| `strip-bg` / `ad-bg` | `#1a191f` |
| `ad-border` | `#34323d` |
| `ad-text` | `#8b8896` |
| `nav-hover` | `#26252e` |

Theme defaults to the OS preference and is overridable by a header toggle (persist the user choice in `localStorage` in production).

### Typography
- **Family:** `Plus Jakarta Sans`, fallback `system-ui, sans-serif`. Weights used: 400, 500, 600, 700, 800. `-webkit-font-smoothing: antialiased`.
- **H1 (hero):** 58px / line-height 1.04 / weight 800 / letter-spacing -0.035em / `text-wrap: balance`. Max-width 760px, centered.
- **Hero subcopy:** 19px / 1.55 / 400 / muted / max-width 540px / `text-wrap: pretty`.
- **Card title:** 16.5px / weight 700 / letter-spacing -0.01em / text color.
- **Card description:** 13.5px / 1.5 / muted.
- **Nav links:** 14px / weight 600 / muted.
- **Buttons & chips:** 13.5px / weight 600.
- **Badges / labels / footer:** 11–13.5px / weight 600.
- **Ad label:** 11px / weight 600 / letter-spacing .12em / uppercase.

### Spacing
8px base scale. Page max-width **1200px**, horizontal padding **28px**. Hero top padding 72px. Section gaps 28–48px. Card padding 20px. Grid gap 16px. Chip gap 9px.

### Radius
- Cards / tools: **18px**
- Trust strip: 20px
- Inputs / search: **15px** (search) / generic inputs 12px
- Buttons (icon): 10px
- Logo tile: 10px; icon tiles inside cards: 12px
- Pills / chips / badges: **999px**
- Ad placeholder: 14px

### Shadow
- Card resting: `0 1px 2px rgba(0,0,0,.03)`
- Card hover: `0 12px 28px rgba(0,0,0,.09)` light / `rgba(0,0,0,.4)` dark, with `translateY(-3px)`, transition `all .18s`
- Search input: `0 1px 2px rgba(0,0,0,.04)`
- Logo tile: `0 4px 12px <accent-glow>`

---

## Screens / Views

### Homepage / Tool Directory
**Purpose:** Land-and-use entry point. Communicate trust ("runs in your browser"), let users search/browse tools, and route into a tool. No sign-up, no modals, no gates.

**Layout (top → bottom), all within a 1200px centered column:**

1. **Sticky header** (height 68px, `backdrop-filter: saturate(160%) blur(12px)`, translucent bg, bottom border):
   - Left: logo = 34px accent rounded-square tile holding a white "magic wand/sparkle" SVG + wordmark "Toolkit" (800, 19px, -0.02em).
   - Nav: text links "Text", "Image", "Convert", "All tools" (muted, hover bg `nav-hover`).
   - Right: 40px square theme-toggle button (sun/moon SVG), `border`, surface bg.

2. **Hero** (centered, 72px top padding):
   - **Trust pill:** rounded-999px, `accent-soft-bg` + border, shield-check SVG in accent + text "Runs 100% in your browser — nothing is ever uploaded" (13px, 600, `accent-soft-text`).
   - **H1:** "Tiny tools that just **work**." — the word "work" in accent color. (Hard line break after "that".)
   - **Subcopy:** "Style your text, shrink your images, convert your files — free, instant, and private. No sign-up, no waiting, no nonsense."
   - **Search input:** max-width 560px, height 58px, leading magnifier SVG (muted), placeholder "Search 40+ tools…", radius 15px. Filters the grid live by name + description.

3. **Ad slot — Leaderboard:** max-width **728px**, height **90px**, centered, dashed border, `ad-bg`. Label "ADVERTISEMENT" + "728 × 90". (In production this is the only above-the-grid ad; keep it calm and clearly labeled — never colored or animated.)

4. **Category filter:** centered wrap row of pill buttons: `All`, `Text`, `Image`, `Convert`, `PDF`, `Utilities`. Active pill = accent fill + white text; inactive = surface bg, border, text. Clicking filters the grid (combine with search query).

5. **Tools grid:** CSS grid `repeat(auto-fill, minmax(264px, 1fr))`, gap 16px — scales from 1 to dozens of tools. Each **tool card** (link):
   - Padding 20px, radius 18px, surface bg, border (→ accent on hover), hover lift + shadow.
   - Top row: 44px icon tile (`accent-soft-bg`, radius 12px) holding a 20px line-icon SVG (stroke = accent, 1.8 width) + a category badge pushed right (`accent-soft-bg`/`accent-soft-text`, 11px, pill).
   - Title (16.5px/700) + description (13.5px/muted).
   - **Seed tools:** Fancy Text Generator (Text), Bold & Italic Text (Text), Image Compressor (Image), Image Converter (Convert), Crop & Resize (Image), QR Code Generator (Utilities), PDF Compressor (PDF), Color Picker (Utilities), Word & Character Counter (Text). Exact copy in the HTML file.

6. **Trust strip:** full-width rounded-20px panel, `strip-bg`, 3-column grid (gap 24px). Each item = 42px soft-accent icon tile + title + body:
   - "Private by default — Files never leave your device. All processing happens locally." (shield SVG)
   - "Instant results — No queues, no uploads, no waiting. It works the moment you type." (lightning SVG)
   - "Free, no sign-up — Every tool is free to use. No account, no paywall, no catch." (check SVG)

7. **Footer:** top border; left = small logo tile + "Toolkit" + "© 2026 · Private by design"; right = links Privacy / About / All tools (muted, 600).

---

## Interactions & Behavior
- **Theme toggle:** swaps the full token set; default from `prefers-color-scheme`; persist choice to `localStorage` in production (prototype uses component state only).
- **Search:** controlled input; filters tools by name + description, case-insensitive, combined with the active category. Empty results should show an empty state (not yet designed — add a friendly "No tools match" message).
- **Category chips:** single-select; `All` clears the category filter.
- **Tool card hover:** border → accent, `translateY(-3px)`, elevated shadow, `transition: all .18s`. Whole card is a link to the tool page.
- **No modals, no onboarding, no cookie wall** — instant usability is a hard product constraint.

## State Management
- `theme`: `'light' | 'dark'` (init from media query; toggle button).
- `query`: search string (controlled input).
- `activeCat`: one of `All | Text | Image | Convert | PDF | Utilities`.
- Tool list is static data: `{ name, iconKey, category, description, href }[]`. Replace icon SVGs with the codebase's icon library where possible.

## Responsive Behavior
Desktop spec above (≤1200px column). Mobile screens are being designed next; in the interim: stack nav into a menu, full-width search, single-column or 2-up tools grid, trust strip stacks to one column, ad slot becomes a `300×250` or responsive unit. Tap targets ≥ 44px.

## Ad Placements (product requirement)
- **Directory page:** one `728×90` leaderboard between hero and grid (responsive `320×100` on mobile). Optionally one in-grid native card every ~8 tools (designed later) — must visually match tool cards and be labeled "Ad".
- **Tool pages (later):** one `300×250` in the sidebar/below the tool, one `728×90` below the SEO content. Never inside the tool's input/output flow.
- All ad slots: clearly labeled, neutral styling, never overlapping content, never interstitial/pop.

## Assets
- All icons are inline single-color line SVGs (stroke-based, 1.8 width) — replace with the target codebase's icon set (Lucide/Phosphor map cleanly). Icon keys used: text, bold, image, convert, crop, qr, pdf, hash, palette, counter, shield, lightning, check, search, sun, moon.
- Font: Plus Jakarta Sans via Google Fonts.
- No raster images in the homepage.

## Files
- `Toolkit Home.dc.html` — high-fidelity homepage prototype (open in a browser to interact: theme toggle, live search, category filter, hover states).
