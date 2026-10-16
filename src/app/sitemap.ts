import type { MetadataRoute } from "next";
import { getProjectDetailSlugs } from "@/lib/portfolioContent";
import { absoluteUrl } from "@/lib/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
    },
    {
      url: absoluteUrl("/beyond-terminal"),
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = getProjectDetailSlugs().map((slug) => ({
    url: absoluteUrl(`/work/${slug}`),
  }));

  return [...staticRoutes, ...projectRoutes];
}
