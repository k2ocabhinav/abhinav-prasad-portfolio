import HomePage from "@/components/HomePage";
import { getHomeContent } from "@/lib/portfolioContent";

// =============================================================================
// Home Page — Server-loads editable portfolio content, then hands it to the
// existing animated client surface.
// =============================================================================

export default function Home() {
  return <HomePage content={getHomeContent()} />;
}
