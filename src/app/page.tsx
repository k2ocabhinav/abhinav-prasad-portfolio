import HomePage from "@/components/HomePage";
import ExperienceProvidersBoundary from "@/components/providers/ExperienceProvidersBoundary";
import { getChronicleEntries, getHomeContent, getProfileContent } from "@/lib/portfolioContent";
import { buildPortfolioJsonLd, serializeJsonLd } from "@/lib/structuredData";

// =============================================================================
// Home Page — Server-loads editable portfolio content, then hands it to the
// existing animated client surface.
// =============================================================================

export default function Home() {
  const content = getHomeContent();
  const structuredData = buildPortfolioJsonLd(getProfileContent(), getChronicleEntries());

  return (
    <>
      <script
        id="portfolio-structured-data"
        type="application/ld+json"
      >
        {serializeJsonLd(structuredData)}
      </script>
      <ExperienceProvidersBoundary>
        <HomePage content={content} />
      </ExperienceProvidersBoundary>
    </>
  );
}
