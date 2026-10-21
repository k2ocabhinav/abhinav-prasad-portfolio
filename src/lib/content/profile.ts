import { cache } from "react";
import path from "path";
import type {
  LandingHeroContent,
  LlmsContent,
  OrchestrationContent,
  ProfileIntroContent,
  PersonalData,
  PortfolioProfile,
} from "@/types";
import { expectedContentCounts, expectedHeroFactLinks, socialPlatforms } from "@/lib/portfolioSchema.mjs";
import {
  CONTENT_ROOT,
  ensureUnique,
  enumValue,
  fail,
  nonEmptyStringArray,
  objectArray,
  objectValue,
  optionalString,
  booleanValue,
  readFrontmatter,
  stringArray,
  stringValue,
  validatePublicAsset,
} from "./shared";

function readProfile(): PortfolioProfile {
  const filePath = path.join(CONTENT_ROOT, "profile.mdx");
  const data = readFrontmatter(filePath);
  const personalData = objectValue(data, "personal", filePath);
  const hero = objectValue(data, "hero", filePath);
  // P7: Structured, editable copy for the human-reviewed orchestration section.
  const orchestrationData = objectValue(data, "orchestration", filePath);
  const profileIntroData = objectValue(data, "profileIntro", filePath);
  const seo = objectValue(data, "seo", filePath);
  const llmsData = objectValue(data, "llms", filePath);

  const personal: PersonalData = {
    name: stringValue(personalData, "name", filePath),
    fullName: stringValue(personalData, "fullName", filePath),
    title: stringValue(personalData, "title", filePath),
    subtitle: stringValue(personalData, "subtitle", filePath),
    hintCopy: nonEmptyStringArray(personalData, "hintCopy", filePath),
    heroPhoto: stringValue(personalData, "heroPhoto", filePath),
    location: {
      city: stringValue(objectValue(personalData, "location", filePath), "city", filePath),
      country: stringValue(objectValue(personalData, "location", filePath), "country", filePath),
      countryCode: stringValue(objectValue(personalData, "location", filePath), "countryCode", filePath),
      timezone: stringValue(objectValue(personalData, "location", filePath), "timezone", filePath),
    },
    email: stringValue(personalData, "email", filePath),
    resumeHref: stringValue(personalData, "resumeHref", filePath),
    socials: objectArray(personalData, "socials", filePath).map((social) => ({
      platform: enumValue(social, "platform", socialPlatforms, filePath),
      label: stringValue(social, "label", filePath),
      href: stringValue(social, "href", filePath),
    })),
    presenceDescription: stringValue(personalData, "presenceDescription", filePath),
    footerTagline: stringValue(personalData, "footerTagline", filePath),
  };
  if (personal.hintCopy.length !== expectedContentCounts.hintCopyLines) {
    fail(filePath, `"personal.hintCopy" must contain ${expectedContentCounts.hintCopyLines} lines`);
  }
  validatePublicAsset(personal.heroPhoto, filePath);
  validatePublicAsset(personal.resumeHref, filePath);

  const knowsAbout = nonEmptyStringArray(data, "knowsAbout", filePath);
  ensureUnique(knowsAbout, "knowsAbout value");

  const heroContent: LandingHeroContent = {
    displayTitle: stringValue(hero, "displayTitle", filePath),
    identity: stringValue(hero, "identity", filePath),
    summary: stringValue(hero, "summary", filePath),
    facts: objectArray(hero, "facts", filePath).map((fact) => ({
      label: stringValue(fact, "label", filePath),
      value: stringValue(fact, "value", filePath),
      href: stringValue(fact, "href", filePath),
    })),
    ctas: objectArray(hero, "ctas", filePath).map((cta) => ({
      label: stringValue(cta, "label", filePath),
      href: stringValue(cta, "href", filePath),
      variant: enumValue(cta, "variant", ["primary", "secondary"] as const, filePath) as "primary" | "secondary",
    })),
  };

  // P7: Keep the process steps and evidence in the same validated profile source.
  const profileIntro: ProfileIntroContent = {
    headline: stringValue(profileIntroData, "headline", filePath),
    proofLines: nonEmptyStringArray(profileIntroData, "proofLines", filePath),
    stackItems: nonEmptyStringArray(profileIntroData, "stackItems", filePath),
  };
  if (profileIntro.proofLines.length !== expectedContentCounts.profileProofLines) {
    fail(filePath, `"profileIntro.proofLines" must contain ${expectedContentCounts.profileProofLines} proof lines`);
  }
  ensureUnique(profileIntro.stackItems, "profile intro stack item");
  const orchestration: OrchestrationContent = {
    intro: stringValue(orchestrationData, "intro", filePath),
    steps: objectArray(orchestrationData, "steps", filePath).map((step) => ({
      title: stringValue(step, "title", filePath),
      description: stringValue(step, "description", filePath),
    })),
  };
  if (orchestration.steps.length !== expectedContentCounts.orchestrationSteps) {
    fail(filePath, `"orchestration.steps" must contain ${expectedContentCounts.orchestrationSteps} steps`);
  }
  const facts = heroContent.facts;
  if (facts.length !== expectedContentCounts.heroFacts) {
    fail(filePath, `"hero.facts" must contain ${expectedContentCounts.heroFacts} rows`);
  }
  facts.forEach((fact, index) => {
    const expected = expectedHeroFactLinks[index];
    if (!expected || fact.label !== expected.label || fact.href !== expected.href) {
      fail(filePath, `"hero.facts[${index}]" must be ${expected?.label ?? "a supported fact"} linking to ${expected?.href ?? "a section"}`);
    }
  });
  const marqueeItems = nonEmptyStringArray(data, "marqueeItems", filePath);
  ensureUnique(marqueeItems, "marquee item");
  const llms: LlmsContent = {
    positioningLines: nonEmptyStringArray(llmsData, "positioningLines", filePath),
    homepageLines: nonEmptyStringArray(llmsData, "homepageLines", filePath),
  };
  const seoContent = {
    title: stringValue(seo, "title", filePath),
    description: stringValue(seo, "description", filePath),
    keywords: stringArray(seo, "keywords", filePath),
    author: stringValue(seo, "author", filePath),
    ogImage: stringValue(seo, "ogImage", filePath),
  };
  validatePublicAsset(seoContent.ogImage, filePath);

  return {
    personal,
    hero: heroContent,
    presenceNodes: objectArray(data, "presenceNodes", filePath).map((node) => ({
      top: stringValue(node, "top", filePath),
      left: stringValue(node, "left", filePath),
      label: stringValue(node, "label", filePath),
      sub: optionalString(node, "sub", filePath),
      active: booleanValue(node, "active", false, filePath),
    })),
    knowsAbout,
    orchestration,
    profileIntro,
    marqueeItems,
    llms,
    seo: seoContent,
  };
}

export const getProfileContent = cache(readProfile);
