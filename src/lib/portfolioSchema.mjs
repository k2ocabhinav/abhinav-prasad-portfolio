/** @type {readonly ["draft", "published"]} */
export const statusValues = ["draft", "published"];

/** @type {readonly ["terminal", "cloud", "database", "sparkles", "cpu"]} */
export const projectIcons = ["terminal", "cloud", "database", "sparkles", "cpu"];

/** @type {readonly ["Used at work", "Part of my workflow", "Built in projects"]} */
export const stackContextValues = ["Used at work", "Part of my workflow", "Built in projects"];

/** @type {readonly ["sage", "peach", "sky", "sand"]} */
export const accents = ["sage", "peach", "sky", "sand"];

/** @type {readonly ["photo", "event", "quote", "person", "project"]} */
export const beyondKinds = ["photo", "event", "quote", "person", "project"];

/** @type {readonly ["cobalt", "coral", "lemon", "amber", "lilac", "pink"]} */
export const beyondColors = ["cobalt", "coral", "lemon", "amber", "lilac", "pink"];

/** @type {readonly ["hero", "wide", "tall", "square"]} */
export const beyondSizes = ["hero", "wide", "tall", "square"];

/** @type {readonly ["github", "linkedin", "email"]} */
export const socialPlatforms = ["github", "linkedin", "email"];

/** @type {readonly ["desktop", "mobile"]} */
export const projectStoryViewports = ["desktop", "mobile"];

/** @type {Readonly<{src: "src", alt: "alt", width: "width", height: "height"}>} */
export const projectOgImageSchema = Object.freeze({
  src: "src",
  alt: "alt",
  width: "width",
  height: "height",
});

/** @type {readonly ["day", "night"]} */
export const projectStoryThemes = ["day", "night"];

/** @type {readonly ["velo-business", "saffron-routes"]} */
export const projectTenantIds = ["velo-business", "saffron-routes"];

/** @type {readonly ["tenant-switcher", "theme-comparison", "schedule"]} */
export const projectStoryLayouts = ["tenant-switcher", "theme-comparison", "schedule"];

/** @type {readonly ["rider", "dispatch", "driver"]} */
export const projectTripRoles = ["rider", "dispatch", "driver"];

export const expectedContentCounts = Object.freeze({
  heroFacts: 2,
  hintCopyLines: 2,
  profileProofLines: 4,
  orchestrationSteps: 4,
  experienceSummaryPoints: 6,
  experienceWorkstreams: 4,
  storyboardTripSteps: 3,
});

export const expectedHeroFactLinks = Object.freeze([
  Object.freeze({ label: "At work", href: "#experience" }),
  Object.freeze({ label: "On my own", href: "#work" }),
]);
