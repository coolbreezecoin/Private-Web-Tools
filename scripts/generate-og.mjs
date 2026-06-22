import { writeFile } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";

const width = 1200;
const height = 630;

const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#4f46e5"/>
  <circle cx="980" cy="120" r="220" fill="white" opacity="0.08"/>
  <circle cx="170" cy="520" r="180" fill="white" opacity="0.07"/>
  <rect x="96" y="96" width="92" height="92" rx="26" fill="white" opacity="0.18"/>
  <path d="M151 122a24 24 0 0 0-32.4 32.4l-31.8 31.8a9 9 0 0 0 12.7 12.7l31.8-31.8a24 24 0 0 0 32.4-32.4l-14.4 14.4-12.7-12.7L151 122Z" fill="white"/>
  <text x="216" y="166" fill="white" font-size="72" font-weight="800" font-family="Arial, Helvetica, sans-serif" letter-spacing="-2">Toolkit</text>
  <text x="96" y="350" fill="white" font-size="82" font-weight="800" font-family="Arial, Helvetica, sans-serif" letter-spacing="-3">Private online tools</text>
  <text x="96" y="442" fill="white" font-size="62" font-weight="700" font-family="Arial, Helvetica, sans-serif" letter-spacing="-2">that just work.</text>
  <text x="100" y="540" fill="white" opacity="0.82" font-size="30" font-weight="500" font-family="Arial, Helvetica, sans-serif">No sign-up. No uploads. Browser-first utilities.</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: {
    mode: "width",
    value: width,
  },
});

const pngData = resvg.render();
await writeFile("public/og-default.png", pngData.asPng());

console.log("Generated public/og-default.png");
