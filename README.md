# Abhinav Portfolio

Next.js 16 single-page portfolio built with the App Router, `motion/react`, and CSS Modules. The site uses an editorial sage-and-cream visual system with scroll-snapped sections:

Hero Carousel -> Profile -> About -> Experience -> Works -> Tech Stack -> Presence -> Contact

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Current State

- Repo initialization is complete.
- `npm run lint` passes.
- `npm run build` passes.
- Hero carousel uses `next/image` and accessible slide controls.
- Mobile navigation includes a slide-out panel, backdrop, `Escape` handling, and scroll locking.
- A dummy resume PDF is included and wired to the primary contact CTA.

## Project Structure

```text
src/
├── app/             # App Router entrypoints and global styles
├── components/      # Sections, layout shell, reusable UI, artifacts
├── data/            # Static content and content configuration
├── hooks/           # Custom interaction and animation hooks
├── lib/             # Shared utilities and animation presets
└── types/           # Shared TypeScript interfaces
```

## Content Configuration

Most site content lives in `src/data/`.

- `src/data/personal.ts`: hero text, profile image, annotations, location, socials, email, and `resumeHref`
- `src/data/projects.ts`: work cards
- `src/data/experience.ts`: timeline entries
- `src/data/techStack.ts`: technical voice cards
- `src/data/presence.ts`: presence map nodes

The download button currently points to `/resume/abhinav-resume.pdf`.

Editable resume source lives in:

- `resume/abhinav-resume.txt`
- `resume/README.md`

Generated public asset lives in:

- `public/resume/abhinav-resume.pdf`

Regenerate the PDF after editing the source:

```bash
cupsfilter -m application/pdf resume/abhinav-resume.txt > public/resume/abhinav-resume.pdf
```

## Workflow

- Work on branches instead of directly on `main`.
- Prefer small, revertable micro commits over a single large commit.
- Update documentation in the same branch when behavior changes.
- See `docs/workflow/AGENT_WORKFLOW.md` for the agent workflow rules.

## Notes

- Fonts are loaded through `next/font/google` in `src/app/layout.tsx`.
- The current hero uses placeholder remote imagery from Unsplash. Replacing those assets with final personal photography is the main remaining content polish step.
