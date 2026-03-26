# Theme Authoring Guide

Complete API reference for creating and customizing themes.

## ArtifactDef Interface

```typescript
interface ArtifactDef {
  id: string;
  svgPath: string;
  viewBox?: string;      // default: "0 0 24 24"
  fill: string;
  size: number;          // px, max 48
  opacity: number;       // 0-1
  x: number;             // % from left (5-20 or 80-95)
  y: number;             // % from top of page
  scrollRange: [number, number];  // [startPct, endPct] of page height
  bobAmplitude: number;  // px, typically 8-20
  bobDuration: number;   // seconds, typically 3-6
  rotationSwing: number;  // degrees, typically 5-15
}
```

## Field-by-Field Guide

### `id`
Unique identifier within the theme. Use kebab-case: `"circle-1"`, `"triangle-left"`.

### `svgPath`
Any valid SVG path data. Examples:

```typescript
// Circle
"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"

// Triangle
"M12 2L2 22h20L12 2z"

// Cross/Plus
"M12 2v20M2 12h20"

// Squiggle
"M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"

// Dot/Circle small
"M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0"

// Diamond
"M12 2l10 10l-10 10L2 12l10-10z"

// Abstract blob
"M12 2c-4 0-8 4-8 8s4 10 8 12c4-2 8-6 8-12s-4-8-8-8z"
```

### `viewBox`
SVG viewBox for coordinate system. Default is `"0 0 24 24"` which works well with most path data.

### `fill`
CSS color value. Portfolio palette:
- `#B8C9C1` — sage
- `#6B7F78` — primary brand
- `#4A3B32` — accent brown
- `#FAF7F2` — surface (cream)

For variety, consider semi-transparent versions:
- `rgba(184, 201, 193, 0.4)` — sage at 40%

### `size`
Pixel size. Range: 20-48px. Keep artifacts small enough to feel ambient.

### `opacity`
CSS opacity. Range: 0.2-0.7. Lower values feel more subtle.

### `x`
Horizontal position as percentage from left edge.

| Zone | Range | Description |
|------|-------|-------------|
| Left | 5-20% | Outer left margin |
| Right | 80-95% | Outer right margin |

### `y`
Vertical position as percentage from top of page. Spread across 0-100% to cover entire scroll.

### `scrollRange`
Two-element array `[startPct, endPct]` defining when the artifact is "active" in the parallax system.

Example: `[0, 100]` means artifact parallax runs for entire page scroll.
Example: `[20, 60]` means artifact only moves during middle section of scroll.

### `bobAmplitude`
Peak-to-peak bobbing distance in pixels. Typical: 8-20px.

### `bobDuration`
Time for one full bob cycle (up + down) in seconds. Typical: 3-6s. Slower feels more relaxed.

### `rotationSwing`
Maximum rotation angle in degrees. Artifact rotates ±this value. Typical: 5-15°.

## Theme Creation Example

```typescript
{
  id: "geometric-minimal",
  name: "Geometric Minimal",
  artifacts: [
    {
      id: "circle-left-1",
      svgPath: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
      fill: "#B8C9C1",
      size: 24,
      opacity: 0.4,
      x: 8,
      y: 15,
      scrollRange: [0, 100],
      bobAmplitude: 10,
      bobDuration: 4,
      rotationSwing: 8,
    },
    {
      id: "triangle-right-1",
      svgPath: "M12 2L2 22h20L12 2z",
      fill: "#6B7F78",
      size: 32,
      opacity: 0.35,
      x: 88,
      y: 45,
      scrollRange: [0, 100],
      bobAmplitude: 14,
      bobDuration: 5,
      rotationSwing: 12,
    },
    // ... more artifacts
  ],
}
```

## Color Guidelines

Artifacts should complement, not compete with, content:

1. **Stick to the palette** — sage greens, cream, brown tones
2. **Low opacity** — 0.3-0.5 feels ambient, not dominant
3. **Vary opacity** — some artifacts more subtle than others creates depth
4. **Limit colors per theme** — 2-3 colors maximum for cohesion

## Positioning Tips

1. **Spread vertically** — artifacts at different Y% cover different scroll positions
2. **Asymmetric placement** — don't mirror left/right exactly, slight variation feels more organic
3. **Avoid content overlap** — outer 15% is safe zone
4. **Density** — 6-8 artifacts is a good baseline; too few looks sparse, too many looks cluttered

## Animation Guidelines

1. **Varied timing** — artifacts with different bobDuration don't sync up
2. **Appropriate amplitude** — larger artifacts can have larger bob
3. **Rotation restraint** — too much rotation (>20°) looks chaotic
4. **Consider scrollRange** — shorter ranges = artifact only appears in part of scroll
