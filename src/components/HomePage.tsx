import ScrollProgress from "@/components/layout/ScrollProgress";
import SageOrb from "@/components/layout/SageOrb";
import Footer from "@/components/layout/Footer";
import BackdropCanvas from "@/components/layout/BackdropCanvas";
import BrandMark from "@/components/layout/BrandMark";
import Marquee from "@/components/layout/Marquee";
import Navigation from "@/components/layout/Navigation";
import LandingExperience from "@/components/landing/LandingExperience";
import AboutSection from "@/components/sections/AboutSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import WorksSection from "@/components/sections/WorksSection";
import TechStackSection from "@/components/sections/TechStackSection";
import ContactSection from "@/components/sections/ContactSection";
import type {
  ChronicleEntry,
  PortfolioProfile,
  PortfolioProject,
  ServiceEntry,
  StackGroup,
} from "@/types";

interface HomeContent {
  profile: PortfolioProfile;
  projects: PortfolioProject[];
  chronicleEntries: ChronicleEntry[];
  stackGroups: StackGroup[];
  services: ServiceEntry[];
}

interface HomePageProps {
  content: HomeContent;
}

export default function HomePage({ content }: HomePageProps) {
  const { profile } = content;

  return (
    <>
      <a className="skip-link" href="#site-content">
        Skip to content
      </a>

      <BackdropCanvas />

      <header data-site-banner="true">
        <BrandMark />
      </header>

      <main
        id="site-content"
        tabIndex={-1}
        className="deferred-section deferred-section-deep site-home"
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "transparent",
        }}
      >
        <LandingExperience
          hero={profile.hero}
          services={[]}
        />

        <AboutSection
          personal={profile.personal}
          intro={profile.profileIntro}
          services={content.services}
          tone="pastel-cream"
        />
        <ExperienceSection experiences={content.chronicleEntries} tone="pastel-blue" />
        <WorksSection
          projects={content.projects}
          orchestration={profile.orchestration}
          tone="pastel-blush"
        />
        <Marquee />
        <TechStackSection
          techCategories={content.stackGroups}
          stackItems={profile.profileIntro.stackItems}
          tone="pastel-peach"
        />
        <ContactSection
          personal={profile.personal}
          presenceNodes={profile.presenceNodes}
        />
      </main>

      <Footer personal={profile.personal} />

      <SageOrb />
      <ScrollProgress />

      <Navigation
        resumeHref={profile.personal.resumeHref}
        email={profile.personal.email}
        linkedinHref={
          profile.personal.socials.find(
            (social) => social.platform === "linkedin"
          )?.href
        }
        fullName={profile.personal.fullName}
      />
    </>
  );
}
