# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 portfolio site using the App Router. Single-page layout with 7 scroll-snap sections (Hero, About, Experience, Works, Tech Stack, Presence, Contact). Animations powered by `motion/react` (Framer Motion). Styling uses CSS Modules with a centralized design token system in `globals.css`.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (fonts, metadata, HTML structure)
│   ├── page.tsx            # Home page — composes all sections
│   └── globals.css          # Design tokens + global styles
├── components/
│   ├── layout/             # Navigation, Footer, ScrollProgress, SageOrb
│   ├── sections/           # 7 page sections (HeroSection, AboutSection, etc.)
│   └── ui/                 # Reusable: MagneticButton, LiveClock, AnimatedDivider, Tag, SectionWrapper
├── data/                   # All static content (personal, projects, experience, navigation, etc.)
├── hooks/                   # Custom hooks (useScrollSpy, useMagneticHover, useCardTilt, etc.)
├── lib/
│   ├── animations.ts        # Centralized Framer Motion variants and spring presets
│   └── utils.ts            # resolveIcon(), scrollToSection(), cn()
└── types/                   # Shared TypeScript interfaces (NavSection, Project, Experience, etc.)
```

### Design System

Design tokens live in `globals.css` as CSS custom properties. Key tokens:

- **Colors**: `--color-surface` (#FAF7F2 cream), `--color-primary-brand` (#6B7F78 sage), `--color-accent-brown` (#4A3B32)
- **Fonts**: `--font-headline` (Cormorant Garamond), `--font-body` (Plus Jakarta Sans), `--font-label` (DM Sans)
- **Z-index scale**: `--z-orb: 100`, `--z-progress: 110`, `--z-nav: 50`, `--z-mobile-menu: 140`, `--z-overlay: 200`

### Key Patterns

**Adding a new section**: Add the section ID to `data/navigation.ts` sections array, create the section component in `components/sections/`, and import it in `app/page.tsx`.

**Icon resolution**: Icons are stored as string keys in data files (e.g., `"terminal"`, `"cloud"`) and resolved at render time via `resolveIcon()` in `lib/utils.ts`. This keeps data files free of JSX imports.

**Animation variants**: All Framer Motion variants are centralized in `lib/animations.ts` — `fadeInUp`, `fadeInLeft`, `scaleIn`, `staggerContainer()`, plus spring presets (`orbSpring`, `magneticSpring`, `tiltSpring`, `panelSpring`, `overlaySpring`).

**Scroll spy**: `useScrollSpy(sectionIds)` uses `IntersectionObserver` to track which section is in view. Used by `Navigation` to highlight the active nav dot.

**CSS Modules**: Component-specific styles live in `.module.css` files alongside their `.tsx` files. Global utility classes (`.content-container`, `.section-padding`, `.glass-card`, `.tag`, `.dot-grid`) are in `globals.css`.

**Easing**: All animations use `easeOut` for entrances. Spring configs use `damping: 20-28` and `stiffness: 100-300` range.

### Commit Conventions

- Use clear, concise commit messages with a short prefix: `feat:`, `fix:`, `refactor:`, `chore:`, etc.
- Do NOT include Co-Authored-By lines in commit messages.
