# 0015 — Gate the Beyond room by browser capability

- Status: accepted
- Date: 2026-10-21

## Context

The Beyond page includes a WebGL room, but the route also needs a useful presentation on devices that should not run the scene.

## Decision

Show a static room poster first and request the client-side 3D scene only after a browser capability check. Use the poster and accessible album list when WebGL 2 is unavailable, device hints indicate limited capacity, reduced motion is preferred, or the scene fails to load.

## Consequences

- The scene bundle is loaded separately from the page shell.
- The poster and album content remain available without a rendered 3D scene.
