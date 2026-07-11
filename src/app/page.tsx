import HomePage from "@/components/HomePage";
import { getHomeContent } from "@/lib/portfolioContent";
import { buildPortfolioJsonLd, serializeJsonLd } from "@/lib/structuredData";

// =============================================================================
// Home Page — Server-loads editable portfolio content, then hands it to the
// existing animated client surface.
// =============================================================================

export default function Home() {
  const content = getHomeContent();
  const structuredData = buildPortfolioJsonLd(content);

  return (
    <>
      <script
        id="portfolio-structured-data"
        type="application/ld+json"
      >
        {serializeJsonLd(structuredData)}
      </script>
      <HomePage content={content} />
    </>
  );
}
