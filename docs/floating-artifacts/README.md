# Floating Artifacts System

A swappable theme layer of ambient decorative elements that float in the page margins, adding depth without disrupting content.

## Architecture

```text
src/
├── components/artifacts/
│   ├── FloatingArtifacts.tsx      # Container — artifact pool, positioning, rendering
│   ├── FloatingArtifacts.module.css
│   └── Artifact.tsx               # Individual artifact with parallax + bobbing
└── data/
    └── themes.ts                  # ALL theme definitions — swap here
```

**Permanent**: The animation engine (`Artifact.tsx` + `FloatingArtifacts.tsx`) never changes when swapping looks.

**Swappable**: `data/themes.ts` contains all visual definitions — artifacts, colors, sizes, positions, animation parameters.

## Quick Start

### Swapping Themes

Change the `activeThemeId` constant in `src/data/themes.ts`:

```typescript
export const activeThemeId = "default"; // Change to any theme ID in THEMES
```

### Adding a New Theme

1. Open `src/data/themes.ts`
2. Add a new theme object to the `THEMES` array:

```typescript
export const THEMES: Theme[] = [
  {
    id: "my-theme",
    name: "My Theme",
    artifacts: [
      {
        id: "artifact-1",
        svgPath: "M12 2L2 22h20L12 2z",
        fill: "#B8C9C1",
        size: 32,
        opacity: 0.5,
        x: 10,
        y: 30,
        scrollRange: [0, 100],
        bobAmplitude: 12,
        bobDuration: 4,
        rotationSwing: 10,
      },
      // ... more artifacts
    ],
  },
];
```

1. Update `activeThemeId` to your new theme ID

## Theme Structure

Each theme contains:

- **`id`**: Unique identifier string
- **`name`**: Display name for debugging/logging
- **`artifacts`**: Array of `ArtifactDef` objects

## Artifact Positioning

Artifacts should primarily live in the outer gutters, but a few can drift into
safe whitespace nearer the content band when the layout needs more visual density.

- **Outer left zone**: 5-20% from left edge
- **Outer right zone**: 80-95% from left edge
- **Inner whitespace accents**: roughly 22-30% and 70-78% when they do not sit
  behind dense text or interactive UI

Avoid placing many artifacts directly behind headings, cards, or form controls.

## Animation System

Each artifact has three animation layers:

1. **Scroll Parallax** — Y drift based on scroll position (±30px range)
2. **Bobbing** — Continuous Y oscillation with configurable amplitude and duration
3. **Rotation** — Subtle ±swing° oscillation

All animations are disabled when `prefers-reduced-motion: reduce` is active.

## Constraints

- `pointer-events: none` — never blocks interaction
- `z-index: 75` — between nav rail (50) and cursor orb (100)
- Desktop-only — hidden below 768px
- Max artifact size: 48px
- Keep opacity subtle enough that artifacts remain atmospheric, not foreground UI

## Future Enhancements

- URL param for manual theme override (`?theme=seasonal`)
- Keyboard shortcut for theme cycling
- Per-artifact click interaction (sounds, particle effects)
- Theme transition animation when switching
