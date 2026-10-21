import "server-only";
import { cache } from "react";
import type { HomeContent, HomeProfile, PortfolioProfile, PortfolioProject, ProjectCard } from "@/types";
import { getChronicleEntries } from "./experience";
import { getProfileContent } from "./profile";
import { getPublishedProjects } from "./projects";
import { getServiceEntries } from "./services";
import { getStackGroups } from "./stack";

function projectCardProjection(project: PortfolioProject): ProjectCard {
  return {
    slug: project.slug,
    id: project.id,
    title: project.title,
    description: project.description,
    icon: project.icon,
    tags: project.tags,
    screenshots: project.screenshots,
    links: project.links,
    detailSlug: project.detailSlug,
    detailCtaLabel: project.detailCtaLabel,
    detailCtaSubline: project.detailCtaSubline,
  };
}

function homeProfileProjection(profile: PortfolioProfile): HomeProfile {
  return {
    personal: profile.personal,
    hero: profile.hero,
    presenceNodes: profile.presenceNodes,
    orchestration: profile.orchestration,
    profileIntro: profile.profileIntro,
    marqueeItems: profile.marqueeItems,
  };
}

export const getPublishedProjectCards = cache((): ProjectCard[] => {
  return getPublishedProjects().map(projectCardProjection);
});

export const getHomeContent = cache((): HomeContent => {
  const profile = getProfileContent();
  const whatsappNumber = process.env.WHATSAPP_E164?.trim();
  if (whatsappNumber && !/^\+\d{10,15}$/.test(whatsappNumber)) {
    throw new Error("WHATSAPP_E164 must be an E.164 number");
  }

  return {
    profile: homeProfileProjection(profile),
    whatsappHref: whatsappNumber
      ? `https://wa.me/${whatsappNumber.slice(1)}?text=${encodeURIComponent(
          "Hi Abhinav, I found your portfolio and would like to talk."
        )}`
      : null,
    projects: getPublishedProjectCards(),
    chronicleEntries: getChronicleEntries(),
    stackGroups: getStackGroups(),
    services: getServiceEntries(),
  };
});
