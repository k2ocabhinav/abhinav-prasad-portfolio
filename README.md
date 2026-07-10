# Abhinav — Engineering Portfolio

A matte editorial portfolio for a backend-leaning full-stack software engineer. The site pairs a warm-paper/riso visual system with real experience, project case studies, and a typed content publishing layer.

## Stack

- Next.js 16 App Router, React 19, and strict TypeScript
- CSS Modules with shared design tokens
- MDX frontmatter parsed on the server
- Motion and Lenis with reduced-motion fallbacks
- Playwright interaction and visual-regression coverage

## Commands

```bash
npm run dev                # Start the development server
npm run check:content      # Validate portfolio frontmatter and local assets
npm run lint               # Run ESLint
npm run build              # Validate content and create a production build
npm run test:e2e           # Run the Playwright suite
npm run capture:portfolio  # Regenerate case-study and social-preview captures
```

## Content system

Public portfolio content lives in `src/content/portfolio/`:

```text
src/content/portfolio/
├── profile.mdx       # Identity, presence, social links, and metadata
├── chronicle/        # Experience timeline entries
├── projects/         # Work cards and full case-study routes
├── services/         # "What I do" cards
├── stack/            # Evidence-scoped technology groups
└── beyond/           # Beyond the Terminal album content
```

Every collection item has a `draft` or `published` status. The server-only loader in `src/lib/portfolioContent.ts` filters drafts, orders collections, and exposes typed content to the App Router. `scripts/check-portfolio-content.mjs` rejects malformed fields, duplicate identifiers, invalid enums, and missing local assets before a production build.

Published project details are statically generated at `/work/[slug]`. Gallery assets live under `public/projects/`.

## Visual and interaction system

The interface uses warm paper, ink, espresso panels, section-specific risograph accents, and Fraunces/Newsreader/Hanken Grotesk/Fragment Mono typography. Motion is concentrated in the opening sequence, scroll-linked section reveals, sheet-rise panels, work-card interactions, and the cross-route Beyond transition. Keyboard focus and reduced-motion paths are part of the interaction model.

## Notes

- The contact CTA requests a resume by email until an approved public PDF is available.
- The profile photograph and Beyond album still use placeholders pending owner-supplied media.
- `abhinav.dev` is a deferred metadata placeholder; update the domain, social-image host, robots, and sitemap together before deployment.
