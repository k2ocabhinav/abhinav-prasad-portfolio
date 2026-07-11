# Abhinav — Engineering Portfolio

A matte editorial portfolio for a backend-leaning full-stack software engineer. The site pairs a warm-paper/riso visual system with real experience, project case studies, and a typed content publishing layer.

## Stack

- Next.js 16 App Router, React 19, and strict TypeScript
- CSS Modules with shared design tokens
- MDX frontmatter parsed on the server
- Motion and Lenis with reduced-motion fallbacks
- Playwright, Axe, and Lighthouse release coverage
- Vercel Speed Insights instrumentation for hosted production builds

## Commands

```bash
npm run dev                # Start the development server
npm run check:content      # Validate portfolio frontmatter and local assets
npm run typecheck          # Run strict TypeScript checks
npm run lint               # Run ESLint
npm run check:dead         # Find unused files and dependencies with Knip
npm run check:security     # Audit production and full dependency trees
npm run build              # Validate content and create a production build
npm run test:e2e           # Run the Playwright suite
npm run test:lighthouse    # Run three mobile Performance and SEO audits
npm run verify             # Run the complete release gate
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

- Use Node 24 LTS, as pinned by `.nvmrc` and `package.json`.
- The approved resume is published at `/resume/abhinav-prasad-resume.pdf`.
- The profile uses a neutral Abhinav monogram until an original portrait is approved.
- Production metadata resolves from the hosting environment or `SITE_URL`; local and preview builds remain `noindex`.
- Speed Insights loads only on Vercel, so local tests do not emit analytics requests.
