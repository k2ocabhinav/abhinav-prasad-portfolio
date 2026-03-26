# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 portfolio site using the App Router. Single-page layout with scroll-snap sections (Hero Carousel → Profile → About → Experience → Works → Tech Stack → Presence → Contact). Animations powered by `motion/react` (Framer Motion v11). Styling uses CSS Modules with a centralized design token system in `globals.css`.

## Commands

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Directory Structure

```text
src/
├── app/                     # Next.js App Router
│   ├── layout.tsx            # Root layout (next/font, metadata, HTML structure)
│   ├── page.tsx             # Home page — composes all sections
│   └── globals.css           # Design tokens + global styles (NO @import — fonts via next/font)
├── components/
│   ├── artifacts/           # FloatingArtifacts + Artifact — ambient SVG layer (mouse-reactive)
│   ├── layout/              # Navigation, Footer, ScrollProgress, SageOrb
│   ├── sections/            # Page sections: HeroSection (carousel+profile), About, Experience,
│   │                        #   Works, TechStack, Presence, Contact
│   └── ui/                  # Reusable: MagneticButton, LiveClock, AnimatedDivider, Tag, SectionWrapper
├── data/                    # All static content (personal, projects, experience, navigation, themes)
├── docs/                    # System documentation (floating-artifacts/)
├── hooks/                   # Custom hooks (useScrollSpy, useMagneticHover, useCardTilt,
│                            #   useHeroSlideshow, useReducedMotion, useSectionInView, etc.)
├── lib/
│   ├── animations.ts         # Centralized Framer Motion variants and spring presets
│   └── utils.ts             # resolveIcon(), scrollToSection(), cn()
└── types/                   # Shared TypeScript interfaces — SINGLE SOURCE OF TRUTH
                             #   All interfaces live here. Data files/hooks import from @/types.
```

### Design System

Design tokens live in `globals.css` as CSS custom properties. Key tokens:

- **Colors**: `--color-surface` (#FAF7F2 cream), `--color-primary-brand` (#6B7F78 sage), `--color-accent-brown` (#4A3B32)
- **Fonts**: `--font-headline` (Cormorant Garamond), `--font-body` (Plus Jakarta Sans), `--font-label` (DM Sans)
  - Fonts are loaded via `next/font/google` in `layout.tsx` (self-hosted, no CLS, no Google CDN request). Do NOT add `@import` to `globals.css`.
  - `next/font` injects CSS variables on `<html>` with higher specificity than `:root`, so the `next/font` values always win at runtime.
- **Z-index scale**: `--z-artifact: 75`, `--z-orb: 100`, `--z-progress: 110`, `--z-nav: 50`, `--z-mobile-menu: 140`, `--z-overlay: 200`
- **Scroll snap**: `scroll-snap-type: y proximity` on `body`. Each `SectionWrapper` renders a `<section>` with `scroll-snap-align: start`. The hero carousel section also has `scroll-snap-align: start` directly in its CSS Module.

### Key Patterns

**Adding a section**: Add the section ID to `data/navigation.ts`, create the component in `components/sections/`, and import it in `app/page.tsx`.

**Icon resolution**: Icons stored as string keys in data (e.g., `"terminal"`, `"cloud"`), resolved at render time via `resolveIcon()` in `lib/utils.ts`. Keeps data files free of JSX imports.

**Animation variants**: Centralized in `lib/animations.ts` — `fadeInUp`, `fadeInLeft`, `scaleIn`, `staggerContainer()`, plus spring presets (`orbSpring`, `magneticSpring`, `tiltSpring`, `panelSpring`, `overlaySpring`).

**Scroll spy**: `useScrollSpy(sectionIds)` uses `IntersectionObserver` to track which section is in view. Used by `Navigation` to highlight the active nav dot.

**CSS Modules**: Component-specific styles live in `.module.css` files alongside their `.tsx` files. Global utility classes (`.content-container`, `.snap-container`, `.glass-card`, `.tag`, `.dot-grid`) are in `globals.css`.

**Types**: All shared interfaces are in `src/types/index.ts`. When adding a new data shape, define the interface in `types/index.ts` first and import it everywhere else — never define interfaces in data files or hooks directly.

**Easing**: All animations use `easeOut` for entrances. Springs use `damping: 20-28`, `stiffness: 100-300` range.

### Hero Section (Two-Part Layout)

`HeroSection.tsx` renders two distinct sections:

1. **Part 1 — Carousel** (`id="hero"`, `section.hero`): Full-screen rotating image carousel with a glass-morphism text panel. Auto-cycles via `useHeroSlideshow`. Managed by `personal.heroSlides`, `personal.heroSlideInterval`, `personal.heroOverlayOpacity`.
   > **Note:** The carousel is a placeholder — a UI designer is creating a custom high-fidelity redesign for a future iteration.

2. **Part 2 — Profile** (`section.profileSection`): Grayscale personal photo with annotation lines + tagline + subtitle. Uses `next/image` for the photo. Photo URL stored in `personal.heroPhoto`. Annotations in `personal.heroAnnotations`.

### Floating Artifacts System

Ambient SVG decorative elements in the page margins. Mouse-reactive (repulsion spring).

- **`components/artifacts/FloatingArtifacts.tsx`** — `"use client"` container. Looks up the active theme and renders `Artifact` per entry.
- **`components/artifacts/Artifact.tsx`** — Individual artifact with 3 animation layers: scroll parallax, bobbing, rotation + mouse repulsion.
- **`data/themes.ts`** — Theme definitions. Change `activeThemeId` to switch themes.
- See `docs/floating-artifacts/README.md` for full documentation.

### Commit Conventions

- Use clear, concise commit messages with a short prefix: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`.
- Do NOT include Co-Authored-By lines in commit messages.
