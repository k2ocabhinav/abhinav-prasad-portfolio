import HeroTextColumn from "./HeroTextColumn";
import AnimatedName from "./AnimatedName";
import type { LandingHeroContent } from "@/types";

interface LandingFrame1HeroProps {
  hero: LandingHeroContent;
  name: string;
  fullName: string;
  linkedinHref: string | undefined;
}

export default function LandingFrame1Hero({
  hero,
  name,
  fullName,
  linkedinHref,
}: LandingFrame1HeroProps) {
  return (
    <>
      <HeroTextColumn
        hero={hero}
        fullName={fullName}
        linkedinHref={linkedinHref}
      />
      <AnimatedName
        name={name}
        portalTrigger={{
          href: "/beyond-terminal",
          source: "easter-egg",
          variant: "portal-bloom",
          skin: "beyond-pastel-mist",
        }}
      />
    </>
  );
}
