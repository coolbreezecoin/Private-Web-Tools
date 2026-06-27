export type ToolStatus = "available" | "comingSoon" | "hidden";
export type ToolCategory = "Text" | "Image" | "Convert" | "PDF" | "Utilities";

export interface SeoConfig {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface LandingPageConfig {
  slug: string;
  route: string;
  featuredStyles: string[];
}

export interface ToolConfig {
  id: string;
  name: string;
  shortName: string;
  category: ToolCategory;
  route: string;
  status: ToolStatus;
  visibility: {
    home: boolean;
    directory: boolean;
    sitemap: boolean;
  };
  icon: string;
  landingPages: LandingPageConfig[];
}

export const tools: ToolConfig[] = [
  {
    id: "fancy-text",
    name: "Fancy Text Generator",
    shortName: "Fancy Text",
    category: "Text",
    route: "/fancy-text",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "text",
    landingPages: [
      {
        slug: "cursive",
        route: "/fancy-text/cursive",
        featuredStyles: ["script", "italic", "boldItalic", "smallCaps"],
      },
      {
        slug: "bold-for-instagram",
        route: "/fancy-text/bold-for-instagram",
        featuredStyles: ["bold", "boldItalic", "monospace", "square"],
      },
      {
        slug: "italic",
        route: "/fancy-text/italic",
        featuredStyles: ["italic", "boldItalic", "script", "monospace"],
      },
      {
        slug: "monospace",
        route: "/fancy-text/monospace",
        featuredStyles: ["monospace", "square", "bold", "italic"],
      },
      {
        slug: "bubble",
        route: "/fancy-text/bubble",
        featuredStyles: ["bubble", "square", "script", "bold"],
      },
      {
        slug: "strikethrough",
        route: "/fancy-text/strikethrough",
        featuredStyles: ["strikethrough", "bold", "italic", "monospace"],
      },
    ],
  },
  {
    id: "word-counter",
    name: "Word & Character Counter",
    shortName: "Word Counter",
    category: "Text",
    route: "/word-counter",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "counter",
    landingPages: [],
  },
  {
    id: "case-converter",
    name: "Case Converter",
    shortName: "Case Converter",
    category: "Text",
    route: "/case-converter",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "case",
    landingPages: [],
  },
  {
    id: "base64",
    name: "Base64 Encoder / Decoder",
    shortName: "Base64",
    category: "Convert",
    route: "/base64",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "code",
    landingPages: [],
  },
  {
    id: "url-encoder",
    name: "URL Encoder / Decoder",
    shortName: "URL Encoder",
    category: "Convert",
    route: "/url-encoder",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "link",
    landingPages: [],
  },
  {
    id: "password-generator",
    name: "Password Generator",
    shortName: "Password Generator",
    category: "Utilities",
    route: "/password-generator",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "key",
    landingPages: [],
  },
  {
    id: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    shortName: "Lorem Ipsum",
    category: "Text",
    route: "/lorem-ipsum",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "text",
    landingPages: [],
  },
  {
    id: "json-formatter",
    name: "JSON Formatter / Validator",
    shortName: "JSON Formatter",
    category: "Utilities",
    route: "/json-formatter",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "code",
    landingPages: [],
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    shortName: "Hash Generator",
    category: "Utilities",
    route: "/hash-generator",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "key",
    landingPages: [],
  },
  {
    id: "qr-code-generator",
    name: "QR Code Generator",
    shortName: "QR Code",
    category: "Utilities",
    route: "/qr-code-generator",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "code",
    landingPages: [],
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    shortName: "UUID Generator",
    category: "Utilities",
    route: "/uuid-generator",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "key",
    landingPages: [],
  },
  {
    id: "color-converter",
    name: "Color Converter",
    shortName: "Color Converter",
    category: "Convert",
    route: "/color-converter",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "case",
    landingPages: [],
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    shortName: "JWT Decoder",
    category: "Utilities",
    route: "/jwt-decoder",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "code",
    landingPages: [],
  },
  {
    id: "timestamp-converter",
    name: "Timestamp Converter",
    shortName: "Timestamp",
    category: "Convert",
    route: "/timestamp-converter",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "counter",
    landingPages: [],
  },
  {
    id: "csv-json",
    name: "CSV to JSON Converter",
    shortName: "CSV to JSON",
    category: "Convert",
    route: "/csv-to-json",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "code",
    landingPages: [],
  },
  {
    id: "number-base-converter",
    name: "Number Base Converter",
    shortName: "Base Converter",
    category: "Convert",
    route: "/number-base-converter",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "counter",
    landingPages: [],
  },
  {
    id: "html-entity",
    name: "HTML Entity Encoder / Decoder",
    shortName: "HTML Entity",
    category: "Utilities",
    route: "/html-entity-encoder",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "code",
    landingPages: [],
  },
  {
    id: "css-gradient",
    name: "CSS Gradient Generator",
    shortName: "CSS Gradient",
    category: "Utilities",
    route: "/css-gradient-generator",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "case",
    landingPages: [],
  },
  {
    id: "diff-checker",
    name: "Diff Checker",
    shortName: "Diff Checker",
    category: "Convert",
    route: "/diff-checker",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "code",
    landingPages: [],
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    shortName: "Regex Tester",
    category: "Convert",
    route: "/regex-tester",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "code",
    landingPages: [],
  },
  {
    id: "box-shadow-generator",
    name: "Box Shadow Generator",
    shortName: "Box Shadow",
    category: "Utilities",
    route: "/box-shadow-generator",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "case",
    landingPages: [],
  },
  {
    id: "url-parser",
    name: "URL Parser",
    shortName: "URL Parser",
    category: "Convert",
    route: "/url-parser",
    status: "available",
    visibility: {
      home: true,
      directory: true,
      sitemap: true,
    },
    icon: "link",
    landingPages: [],
  },
];

export const comingSoonTools = [
  {
    id: "image-compressor",
    name: "Image Compressor",
    category: "Image" as const,
    description: "Shrink images locally in your browser.",
  },
  {
    id: "image-converter",
    name: "Image Converter",
    category: "Convert" as const,
    description: "Convert JPG, PNG, WebP, and AVIF without uploads.",
  },
];

export const availableTools = tools.filter((tool) => tool.status === "available");

export function getToolById(id: string) {
  return tools.find((tool) => tool.id === id);
}

export function requireTool(id: string) {
  const tool = getToolById(id);
  if (!tool) {
    throw new Error(`Tool is missing from the registry: ${id}`);
  }
  return tool;
}

export function getFancyTextTool() {
  return requireTool("fancy-text");
}

export function getWordCounterTool() {
  return requireTool("word-counter");
}

export function getCaseConverterTool() {
  return requireTool("case-converter");
}

export function getBase64Tool() {
  return requireTool("base64");
}

export function getUrlEncoderTool() {
  return requireTool("url-encoder");
}

export function getPasswordGeneratorTool() {
  return requireTool("password-generator");
}

export function getLoremIpsumTool() {
  return requireTool("lorem-ipsum");
}

export function getJsonFormatterTool() {
  return requireTool("json-formatter");
}

export function getHashGeneratorTool() {
  return requireTool("hash-generator");
}

export function getQrCodeTool() {
  return requireTool("qr-code-generator");
}

export function getUuidGeneratorTool() {
  return requireTool("uuid-generator");
}

export function getColorConverterTool() {
  return requireTool("color-converter");
}

export function getJwtDecoderTool() {
  return requireTool("jwt-decoder");
}

export function getTimestampConverterTool() {
  return requireTool("timestamp-converter");
}

export function getCsvJsonTool() {
  return requireTool("csv-json");
}

export function getNumberBaseConverterTool() {
  return requireTool("number-base-converter");
}

export function getHtmlEntityTool() {
  return requireTool("html-entity");
}

export function getCssGradientTool() {
  return requireTool("css-gradient");
}

export function getDiffCheckerTool() {
  return requireTool("diff-checker");
}

export function getRegexTesterTool() {
  return requireTool("regex-tester");
}

export function getBoxShadowGeneratorTool() {
  return requireTool("box-shadow-generator");
}

export function getUrlParserTool() {
  return requireTool("url-parser");
}
