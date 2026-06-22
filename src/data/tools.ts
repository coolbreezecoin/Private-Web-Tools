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
  keyword: string;
  h1: string;
  intro: string;
  body: string[];
  featuredStyles: string[];
  seo: SeoConfig;
  howTo: HowToStep[];
  faq: FAQItem[];
}

export interface ToolConfig {
  id: string;
  name: string;
  shortName: string;
  locale?: string;
  // Future extension point: contentByLocale can hold localized SEO, HowTo, FAQ, and landing page copy.
  category: ToolCategory;
  route: string;
  status: ToolStatus;
  visibility: {
    home: boolean;
    directory: boolean;
    sitemap: boolean;
  };
  description: string;
  icon: string;
  privacyNote: string;
  seo: SeoConfig;
  howTo: HowToStep[];
  faq: FAQItem[];
  landingPages: LandingPageConfig[];
}

const fancyTextHowTo: HowToStep[] = [
  {
    name: "Type your text",
    text: "Enter the plain text you want to style in the input box.",
  },
  {
    name: "Choose a style",
    text: "Browse bold, italic, cursive, monospace, bubble, square, strikethrough, small caps, and zalgo text styles.",
  },
  {
    name: "Copy the result",
    text: "Use the copy button next to the style you like and paste it into your bio, caption, comment, or message.",
  },
];

const fancyTextFaq: FAQItem[] = [
  {
    question: "Does this fancy text generator upload my text?",
    answer: "No. The text is transformed locally in your browser. Your input is not uploaded to a server.",
  },
  {
    question: "Why does fancy text work in social apps?",
    answer: "The tool uses Unicode characters that look like styled letters. Most social apps treat them as regular text you can copy and paste.",
  },
  {
    question: "Will every style work everywhere?",
    answer: "Most styles work in popular apps, but support can vary by platform, device, and font. If a style looks odd, try another one.",
  },
  {
    question: "Can I use this for Instagram, TikTok, Discord, and X?",
    answer: "Yes. You can copy the generated text and paste it into bios, captions, usernames, posts, comments, and chats where Unicode text is supported.",
  },
];

const wordCounterHowTo: HowToStep[] = [
  {
    name: "Paste or type your text",
    text: "Add the draft, caption, bio, essay, post, or message you want to measure.",
  },
  {
    name: "Review live counts",
    text: "Check words, characters, characters without spaces, sentences, paragraphs, lines, and estimated reading time.",
  },
  {
    name: "Edit and copy",
    text: "Adjust your text until it fits your target length, then copy the cleaned draft if you need it.",
  },
];

const wordCounterFaq: FAQItem[] = [
  {
    question: "Does the word counter upload my text?",
    answer: "No. The counts are calculated locally in your browser. Your text is not uploaded to a server.",
  },
  {
    question: "What counts as a word?",
    answer: "A word is counted when it has letters, numbers, or apostrophes separated by spaces or punctuation.",
  },
  {
    question: "Does it count spaces?",
    answer: "Yes. The tool shows total characters with spaces and a separate count for characters without spaces.",
  },
  {
    question: "How is reading time estimated?",
    answer: "Reading time is estimated from the word count using a typical reading speed of 200 words per minute.",
  },
];

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
    description: "Create stylish Unicode text for bios, captions, names, and comments.",
    icon: "text",
    privacyNote: "Your text stays in your browser. Nothing is uploaded.",
    seo: {
      title: "Fancy Text Generator - Copy and Paste Stylish Unicode Text",
      description:
        "Create bold, cursive, italic, bubble, monospace, and other fancy Unicode text styles instantly. Your text stays in your browser.",
      path: "/fancy-text",
    },
    howTo: fancyTextHowTo,
    faq: fancyTextFaq,
    landingPages: [
      {
        slug: "cursive",
        keyword: "cursive text generator",
        h1: "Cursive Text Generator",
        intro:
          "Turn plain letters into cursive and script-style Unicode text you can copy and paste into social profiles, captions, and messages.",
        body: [
          "Cursive text works best when you want a softer, more personal look for short names, profile lines, or decorative phrases. This page puts script-style results first so you can compare elegant options without hunting through the full list.",
          "Everything is converted on your device as you type. That makes it comfortable to test usernames, private notes, or draft bio text before you decide what to paste into another app.",
          "For readability, keep cursive text to a few words or one short sentence. Decorative Unicode is most effective as an accent, not as a full paragraph.",
        ],
        featuredStyles: ["script", "italic", "boldItalic", "smallCaps"],
        seo: {
          title: "Cursive Text Generator - Copy and Paste Script Text",
          description:
            "Create cursive and script-style Unicode text for bios, captions, and messages. Free, instant, and private in your browser.",
          path: "/fancy-text/cursive",
        },
        howTo: [
          {
            name: "Enter your words",
            text: "Type the name, phrase, bio line, or caption you want to turn into cursive text.",
          },
          {
            name: "Preview cursive styles",
            text: "The cursive and script results update instantly, along with related italic and small caps options.",
          },
          {
            name: "Copy and paste",
            text: "Copy the result you like and paste it into the app or profile field you are editing.",
          },
        ],
        faq: [
          {
            question: "Is this a real cursive font?",
            answer:
              "It is Unicode text that looks like cursive lettering. That means you can copy and paste it like normal text in many apps.",
          },
          {
            question: "Can I use cursive text in an Instagram bio?",
            answer:
              "Yes, Instagram usually supports these Unicode characters in bios, captions, and comments, though exact rendering depends on the device.",
          },
          {
            question: "Why are some letters less decorative?",
            answer:
              "Unicode script characters do not perfectly match every English letter style, so some characters may look more formal than handwritten.",
          },
        ],
      },
      {
        slug: "bold-for-instagram",
        keyword: "bold text for Instagram",
        h1: "Bold Text for Instagram",
        intro:
          "Make bold Unicode text for Instagram bios, captions, comments, and profile highlights without installing an app or uploading anything.",
        body: [
          "Instagram does not include a bold formatting control for bios and captions, so this generator creates bold-looking Unicode characters you can paste directly into the field you are editing.",
          "Use bold text for names, calls to action, section labels, or one important phrase in a caption. A small amount of emphasis usually looks cleaner than turning an entire post into styled characters.",
          "The generator does not connect to Instagram or send your draft anywhere. You can test caption ideas in the browser, copy the version that fits, and paste it manually into Instagram.",
        ],
        featuredStyles: ["bold", "boldItalic", "monospace", "square"],
        seo: {
          title: "Bold Text for Instagram - Copy and Paste Bold Unicode Fonts",
          description:
            "Make bold text for Instagram bios, captions, comments, and posts. Free, instant, and private in your browser.",
          path: "/fancy-text/bold-for-instagram",
        },
        howTo: [
          {
            name: "Write your Instagram text",
            text: "Type the bio line, caption phrase, or comment you want to emphasize.",
          },
          {
            name: "Pick a bold style",
            text: "Choose from bold, bold italic, monospace, or square Unicode text styles.",
          },
          {
            name: "Paste into Instagram",
            text: "Copy the styled text and paste it into your Instagram bio, caption, comment, or profile field.",
          },
        ],
        faq: [
          {
            question: "Can Instagram display bold text?",
            answer:
              "Instagram does not provide a native bold button for bios or captions, but it usually displays bold-looking Unicode characters.",
          },
          {
            question: "Is this safe for my Instagram account?",
            answer:
              "Yes. This tool only creates copyable text in your browser. It does not connect to your Instagram account.",
          },
          {
            question: "Should I make my whole caption bold?",
            answer:
              "Short bold phrases usually work best. Long blocks of styled text can be harder to read and may not render perfectly everywhere.",
          },
        ],
      },
      {
        slug: "italic",
        keyword: "italic text generator",
        h1: "Italic Text Generator",
        intro:
          "Create italic Unicode text for captions, bios, notes, and messages. Type once, preview instantly, and copy the result you like.",
        body: [
          "Italic Unicode is useful for gentle emphasis, quotes, side notes, and captions that need a little contrast without the weight of bold text.",
          "This page starts with italic and bold italic results, then keeps related styles nearby so you can decide whether your text should feel subtle, polished, or more decorative.",
          "Your draft is measured and transformed inside the page only. If a platform renders one italic character oddly, try the script or monospace alternatives before posting.",
        ],
        featuredStyles: ["italic", "boldItalic", "script", "monospace"],
        seo: {
          title: "Italic Text Generator - Copy and Paste Italic Unicode Text",
          description:
            "Generate italic and bold italic Unicode text for social posts, bios, and comments. No sign-up, no uploads, just copy and paste.",
          path: "/fancy-text/italic",
        },
        howTo: [
          {
            name: "Type plain text",
            text: "Enter the sentence, name, or phrase you want to make italic.",
          },
          {
            name: "Compare italic outputs",
            text: "Review italic, bold italic, script, and related styles as they update in real time.",
          },
          {
            name: "Copy the styled text",
            text: "Use the copy button and paste the italic Unicode text wherever your app supports it.",
          },
        ],
        faq: [
          {
            question: "Is italic Unicode the same as italic formatting?",
            answer:
              "No. It uses different Unicode characters that look italic, so it can be pasted into apps that do not offer formatting controls.",
          },
          {
            question: "Can I use italic text in comments?",
            answer:
              "Usually yes. Many social platforms, chat apps, and forums accept these Unicode characters in comments and messages.",
          },
          {
            question: "What happens to numbers and punctuation?",
            answer:
              "Characters with a matching Unicode style are transformed. Other characters, including many symbols, stay readable as-is.",
          },
        ],
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
    description: "Count words, characters, sentences, paragraphs, lines, and reading time instantly.",
    icon: "counter",
    privacyNote: "Your text stays in your browser. Nothing is uploaded.",
    seo: {
      title: "Word & Character Counter - Count Text Instantly",
      description:
        "Count words, characters, sentences, paragraphs, lines, and estimated reading time instantly. Free, private, and processed in your browser.",
      path: "/word-counter",
    },
    howTo: wordCounterHowTo,
    faq: wordCounterFaq,
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

export function getFancyTextTool() {
  const tool = getToolById("fancy-text");
  if (!tool) {
    throw new Error("Fancy Text tool is missing from the registry.");
  }
  return tool;
}

export function getWordCounterTool() {
  const tool = getToolById("word-counter");
  if (!tool) {
    throw new Error("Word Counter tool is missing from the registry.");
  }
  return tool;
}
