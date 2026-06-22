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
