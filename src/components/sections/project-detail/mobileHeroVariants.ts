// Art-directed phone captures that have a pre-encoded AVIF sibling. The WebP
// stays in the <picture> as the fallback, so the AVIF only ever saves bytes on
// browsers that can decode it. Encoded from the same 640x1007 source at q75.
const MOBILE_HERO_AVIF: Record<string, string> = {
  "/projects/velo/velo-livery-day-mobile.webp":
    "/projects/velo/velo-livery-day-mobile.avif",
};

export function getMobileHeroAvif(src: string): string | undefined {
  return MOBILE_HERO_AVIF[src];
}
