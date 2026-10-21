# 0014 — Scope scroll work and favor composited transitions

- Status: accepted
- Date: 2026-10-21

## Context

Scroll-linked work should remain limited to the elements and state that need to respond to the current view.

## Decision

Share section visibility state across page chrome, cache layout measurements outside scroll callbacks, and stop section trackers when their targets are off screen. Prefer opacity and transform for transitions. Enable Lenis only for fine pointers and disable motion effects for reduced-motion preferences.

## Consequences

- Inactive sections do not keep scroll trackers running.
- Touch-first scrolling stays native, and fixed backdrop transitions avoid repeated full-layer repainting.
