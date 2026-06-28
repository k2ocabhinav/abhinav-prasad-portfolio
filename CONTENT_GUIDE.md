# Portfolio Content Guide

This site is now designed so most public portfolio truth lives in MDX frontmatter under:

```text
src/content/portfolio/
```

You can edit these files without changing React components. The visual and motion engine reads the content and adapts to what is published.

## Publishing Rule

Every item that can appear publicly has:

```yaml
status: "draft"
```

or:

```yaml
status: "published"
```

Draft items stay local and do not render on the public homepage, Works, Chronicle, Stack, Services, or Beyond photo wall.

## What To Edit

Edit `src/content/portfolio/profile.mdx` for:

- Name rendered in the hero.
- Role rotator words below `Abhinav`.
- Hero supporting copy and CTA labels.
- Profile tagline and subtitle.
- Philosophy copy.
- Email, resume link, socials, location, presence copy.
- SEO title, description, keywords, and preview image.

Edit `src/content/portfolio/projects/*.mdx` for:

- Selected Works cards.
- Full case-study routes such as `/work/velo`.
- Project screenshots, tags, claim, proof beats, links, and publish state.

Edit `src/content/portfolio/chronicle/*.mdx` for:

- Chronicle timeline entries.
- Date, title, context/company, tags, and visibility.

Edit `src/content/portfolio/services/*.mdx` for:

- What I Do cards.

Edit `src/content/portfolio/stack/*.mdx` for:

- Stack/tool groups.

Edit `src/content/portfolio/beyond/*.mdx` for:

- Beyond The Terminal photo-wall items.
- Photos, tags, captions, quotes, metadata, color, and card size.

## Works Publishing

The homepage renders one canonical work surface: `Selected Works` at `#work`.
It lists every published project sorted by:

```yaml
worksOrder: 1
```

The older featured-work fields are still accepted for compatibility with dormant
components, but they are not used by the current homepage flow:

```yaml
featuredOrder: 1
featured: true
```

If you only have one real project, publish only one. Draft projects stay hidden.

## Add A Project

Create a new file:

```text
src/content/portfolio/projects/my-project.mdx
```

Start as a draft:

```yaml
---
slug: "my-project"
status: "draft"
featured: false
featuredOrder: 99
worksOrder: 2
id: "02"
title: "My Project"
description: "One concrete sentence about what this project really is."
scopeSummary: "Optional short proof line for the Works card."
icon: "terminal"
accent: "sage"
projectCodeTone: "lime"
eyebrow: "Project Type"
claim: "One bold claim."
summary: "One skim-friendly explanation."
note: "Short context note."
tags:
  - "Next.js"
  - "AWS"
links:
  - label: "GitHub"
    href: null
screenshots: []
visual:
  kind: "system"
  alt: "Technical visual for My Project"
  caption: "System visual"
proofBeats:
  - label: "Problem"
    short: "The problem in one short line."
    detail: "A slightly fuller but still honest explanation."
  - label: "My Role"
    short: "What you personally did."
    detail: "Mention only work you actually owned."
  - label: "Shipped"
    short: "What exists now."
    detail: "Keep this factual."
  - label: "Impact"
    short: "Why it mattered."
    detail: "Use real impact, not inflated claims."
detail:
  enabled: false
---
```

When it is ready, change:

```yaml
status: "published"
featured: true
```

Use `detail.enabled: true` only when you have enough real screenshots and detail for a case-study route.

## Add A Chronicle Entry

Create:

```text
src/content/portfolio/chronicle/my-entry.mdx
```

```yaml
---
slug: "my-entry"
status: "draft"
order: 1
date: "2026"
title: "Role or Milestone"
company: "Company, team, project, or context"
tags:
  - "Backend"
  - "Cloud"
---
```

Publish it by changing `status` to `published`.

## Add A Service Card

```yaml
---
id: "backend-systems"
status: "published"
order: 1
title: "Backend Systems"
description: "Short, truthful description of what you can do."
icon: "cpu"
accent: "sage"
tags:
  - "Spring Boot"
  - "APIs"
---
```

Icons resolve through the site icon map. Current safe values include `terminal`, `cloud`, `database`, `sparkles`, and `cpu`.

## Add A Stack Group

```yaml
---
id: "cloud"
status: "published"
order: 1
icon: "cloud"
label: "Cloud"
content: "AWS, serverless, CI/CD, Docker, and deployment workflows."
---
```

## Add A Beyond Album Item

Put future photos in:

```text
public/beyond-terminal/album/
```

Then create:

```yaml
---
id: "hackathon-2026"
status: "draft"
order: 1
kind: "event"
title: "Hackathon sprint"
caption: "Short caption. Keep it visual and human."
tags:
  - "hackathon"
  - "team"
meta: "Mumbai / 2026"
color: "cobalt"
size: "wide"
image:
  src: "/beyond-terminal/album/hackathon-2026.jpg"
  alt: "Abhinav with teammates at a hackathon."
  aspectRatio: "16 / 9"
  dominantColor: "#245DFF"
---
```

Publish it by changing `status` to `published`.

## Validation

Run:

```bash
npm run check:content
```

The normal build also runs this automatically:

```bash
npm run build
```

Validation catches common content mistakes:

- Duplicate project slugs or ids.
- Invalid `status` values.
- Missing required titles, tags, proof beats, or image alt text.
- Broken local image paths under `public/`.
- Invalid Featured Work labels, colors, or visual kinds.

## Current Truth Model

Right now, Velo is the only published project. The sample draft project and draft Chronicle entry are intentionally hidden until you replace them with real updates.
