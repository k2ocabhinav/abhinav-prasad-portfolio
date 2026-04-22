# Beyond The Terminal Guardrails

## Fonts

- `Archivo` is the Beyond display voice. Use it for landing headlines, card titles, archive/article titles, and major pull quotes.
- `Manrope` is the default reading and UI face inside Beyond.
- `IBM Plex Mono` is reserved for labels, timestamps, route chrome, and metadata.
- Do not pull the main portfolio font stack into Beyond components unless a fallback is unavoidable.

## Motion

- The portal bloom remains the only signature cross-route entry effect into Beyond.
- Allowed motion vocabulary: opacity, transform, clip-path, restrained blur, and GSAP ScrollTrigger choreography tied to band reveals and depth.
- Landing-page smooth scroll may use Lenis, but archive and article routes should default to native scrolling.
- Reduced-motion users must skip Lenis and pinning and receive short transform/opacity reveals only.
- Never animate `width`, `height`, `top`, `left`, or heavy filter stacks during scroll.

## Visual System

- The shell stays `charcoal + pastel mist`, with dusty lavender, powder blue, pale silver, and muted peach acting as the only approved accent family.
- Use oversized rectangular cards with one shared border contract: outer border, inner frame, consistent label position, and one symbol placement zone.
- Keep the landing page to one dominant focal point per viewport.
- Article pages may introduce a cool paper reading surface, but the outer chrome must remain aligned with the landing shell.

## Regressions To Avoid

- No return to the previous electric-blue noir palette.
- No floating tiles, chapter-chip strips, or multi-link sticky nav bars on the Beyond home page.
- No small icon clutter, generic SaaS cards, or decorative motion that competes with the reading order.
- Do not leak Beyond tokens or GSAP/Lenis behavior into the main portfolio routes.

## Adding Cards And Posts

- Keep landing content in `src/data/beyondTerminal.ts` using the deterministic act/card model.
- Prefer `hero_split`, `wide_strip`, `wide_strip_reverse`, `journal_feature`, and `journal_secondary` before inventing new layouts.
- Store journal entries as MDX in `src/content/beyond-terminal/journal/` with typed `export const metadata`.
- Keep Beyond placeholder-safe assets local under `public/beyond-terminal/` so future swaps stay content-only.
