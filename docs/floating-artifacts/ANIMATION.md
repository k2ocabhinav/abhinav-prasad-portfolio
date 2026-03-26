# Animation System Reference

Deep dive into the three animation layers that power each floating artifact.

## Overview

Each artifact has three independent animation systems:

1. **Scroll Parallax** — Y-axis drift tied to page scroll position
2. **Bobbing** — Continuous Y oscillation (up/down loop)
3. **Rotation** — Subtle rotation oscillation (±swing°)

All three run simultaneously, creating organic, non-mechanical movement.

## Scroll Parallax

Parallax creates depth by moving artifacts at different rates during scroll.

### Implementation

```typescript
const { scrollYProgress } = useScroll();
const y = useTransform(scrollYProgress, [0, 1], [-30, 30]);
```

The `useTransform` maps scroll progress (0-1) to Y offset (-30px to +30px).

### Per-Artifact Scroll Range

Each artifact defines `scrollRange: [startPct, endPct]` to control when its parallax is active:

```typescript
// Artifact only moves during middle 50% of page scroll
scrollRange: [25, 75]

// Transforms would use:
const y = useTransform(
  scrollYProgress,
  [startPct / 100, endPct / 100],
  [-30, 30]
);
```

### Why Parallax Matters

- Creates illusion of depth (artifacts further from "camera" move slower)
- Artifacts in outer margins seem to float above content
- Subtle parallax maintains the ambient, non-distracting quality

## Bobbing Animation

Continuous vertical oscillation keeps artifacts feeling alive.

### Implementation

```typescript
const yMotion = useMotionValue(initialY);
const springConfig = { type: "spring", damping: 22, stiffness: 120, mass: 0.3 };

// Animate Y with repeatType: "reverse" for smooth up-down motion
useEffect(() => {
  const controls = animate(yMotion, [0, -bobAmplitude, 0], {
    duration: bobDuration,
    repeat: Infinity,
    repeatType: "reverse",
    delay: randomDelay, // 0-2s stagger
    ease: "easeInOut",
  });
  return () => controls.stop();
}, [yMotion, bobAmplitude, bobDuration, randomDelay]);
```

### Randomization

Each artifact gets a random initial delay (0-2s) so bob cycles don't sync across artifacts:

```typescript
const randomDelay = Math.random() * 2;
```

### Spring Config

```typescript
{ type: "spring", damping: 22, stiffness: 120, mass: 0.3 }
```

- **damping: 22** — Smooth, slightly underdamped for organic feel
- **stiffness: 120** — Responsive but not snappy
- **mass: 0.3** — Light mass allows quick direction changes

## Rotation Animation

Subtle rotation oscillation adds life without distraction.

### Implementation

```typescript
const rotateMotion = useMotionValue(0);

useEffect(() => {
  const controls = animate(rotateMotion, [0, rotationSwing, 0, -rotationSwing, 0], {
    duration: bobDuration * 1.5, // Slower than bobbing
    repeat: Infinity,
    repeatType: "loop",
    ease: "easeInOut",
    delay: randomDelay,
  });
  return () => controls.stop();
}, [rotateMotion, rotationSwing, bobDuration, randomDelay]);
```

### Rotation Swing Values

| Effect | rotationSwing |
|--------|---------------|
| Very subtle | 3-5° |
| Subtle | 5-10° |
| Moderate | 10-15° |
| Excessive | >20° |

Keep below 15° for ambient artifacts.

## Reduced Motion

All animation loops disable when `prefers-reduced-motion: reduce` is active.

### Detection

```typescript
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;
```

### Behavior When Reduced Motion Active

- No bobbing animation (artifact stays at rest Y position)
- No rotation oscillation (artifact at 0° rotation)
- Parallax still works (scroll-based Y transform) — this is considered essential functionality, not decorative motion
- Artifact renders at initial rest position with no looping animations

### CSS Fallback

```css
@media (prefers-reduced-motion: reduce) {
  .artifact-bob {
    animation: none;
  }
  .artifact-rotate {
    animation: none;
  }
}
```

## Animation Compositing

All three animations combine on the artifact's transform:

```typescript
<motion.div
  style={{
    y: useTransform(scrollYProgress, [0, 1], [-30, 30]),
    rotate: rotateMotion,
  }}
>
  <motion.div
    style={{ y: yMotion }}
  >
    {/* SVG artifact */}
  </motion.div>
</motion.div>
```

The outer `motion.div` handles parallax + rotation, while inner `motion.div` handles bobbing relative to that position.

## Performance Considerations

1. **useMotionValue** — motion/react's optimized motion values avoid re-renders
2. **transform: translate3d** — hardware-accelerated, compositor-only properties
3. **will-change** — CSS hint for browser optimization (applied via motion/react)
4. **No layout thrashing** — all animations are transform/opacity only

## Troubleshooting

### Artifacts sync up and look mechanical
Increase variation in `bobDuration` across artifacts. Each artifact should have a noticeably different duration (e.g., 3s, 4.5s, 6s).

### Artifacts move too much and distract
Reduce `bobAmplitude` to 5-8px and `rotationSwing` to 3-5°.

### Artifacts block content
Verify X position is in outer 15% (5-20% or 80-95%). Also check `pointer-events: none` is applied.

### Artifacts don't appear
1. Check viewport width — they're hidden below 768px
2. Verify `activeThemeId` matches a theme in `THEMES`
3. Check browser console for errors in Artifact.tsx
4. Confirm z-index is not covered by another element

## Mouse Proximity Reaction

Artifacts detect mouse proximity and repel away from the cursor, creating an interactive "dodge" effect.

### Implementation

```typescript
// Shared mouse position - module level so all artifacts share it
const sharedMouseX = useMotionValue(-1000);
const sharedMouseY = useMotionValue(-1000);

// Track mouse position globally
useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    sharedMouseX.set(e.clientX);
    sharedMouseY.set(e.clientY);
  };
  window.addEventListener("mousemove", handleMouseMove);
  return () => window.removeEventListener("mousemove", handleMouseMove);
}, []);

// Mouse repulsion spring
const repulsionX = useSpring(useMotionValue(0), {
  type: "spring",
  damping: 25,
  stiffness: 150,
  mass: 0.4,
});
const repulsionY = useSpring(useMotionValue(0), {
  type: "spring",
  damping: 25,
  stiffness: 150,
  mass: 0.4,
});
```

### Influence Radius

The repulsion effect activates within a **120px radius** of the artifact center:

```typescript
const INFLUENCE_RADIUS = 120;
const MAX_DISPLACEMENT = 50;
```

When the mouse enters this radius, the artifact pushes away with a displacement that scales linearly from 0 (at edge) to 50px (at center).

### Spring Physics Parameters

```typescript
{ type: "spring", damping: 25, stiffness: 150, mass: 0.4 }
```

- **damping: 25** — Smooth damping for natural deceleration without oscillation
- **stiffness: 150** — Responsive pullback to neutral position
- **mass: 0.4** — Light mass for quick, snappy reaction

### Combining with Other Animations

Repulsion is combined with scroll parallax using `useTransform`:

```typescript
<motion.div style={{
  y: useTransform([parallaxY, repulsionY], ([parallax, repel]) => parallax + repel)
}}>
```

This approach:
1. Preserves the parallax scroll effect
2. Adds repulsion displacement on top
3. Uses `useTransform` to combine motion values without re-renders
4. The spring physics ensure smooth transitions when the mouse enters/exits the influence zone

### Reduced Motion Behavior

When `prefers-reduced-motion: reduce` is active, mouse repulsion is disabled:

```typescript
useEffect(() => {
  if (!mounted || prefersReducedMotion) {
    repulsionX.set(0);
    repulsionY.set(0);
    return;
  }
  // ... repulsion calculation loop
}, [mounted, prefersReducedMotion, repulsionX, repulsionY]);
```

The artifact remains static regarding mouse interaction but retains parallax and other animations that don't cause looping motion.
