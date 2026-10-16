import type { MetadataRoute } from "next";
import { getProjectDetailSlugs } from "@/lib/portfolioContent";
import { absoluteUrl } from "@/lib/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  // /beyond-terminal is a link-only easter egg: it stays out of the sitemap
  // and is marked noindex by its own layout.
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = getProjectDetailSlugs().map((slug) => ({
    url: absoluteUrl(`/work/${slug}`),
  }));

  return [...staticRoutes, ...projectRoutes];
}
