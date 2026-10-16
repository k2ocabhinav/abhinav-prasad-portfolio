import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/lib/siteConfig";

const ALLOWED_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Googlebot",
  "Google-Extended",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "Meta-WebIndexer",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "PerplexityBot",
  "Perplexity-User",
  "DuckAssistBot",
  "Amazonbot",
  "Amzn-SearchBot",
  "Amzn-User",
  "CCBot",
] as const;

export function buildRobots(isIndexable: boolean): MetadataRoute.Robots {
  if (!isIndexable) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: [...ALLOWED_AGENTS],
        allow: "/",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

export default function robots(): MetadataRoute.Robots {
  return buildRobots(siteConfig.isIndexable);
}
