# Beyond The Terminal Guardrails

## Fonts

- `Bricolage Grotesque` is the display voice for the photo-wall title and item headings.
- `Plus Jakarta Sans` is the reading and UI face.
- `Space Mono` is reserved for labels, metadata, tags, and route chrome.
- Keep the Beyond font variables scoped to the Beyond layout.

## Motion

- The portal bloom remains the only signature cross-route entry effect.
- Photo-wall interaction may use restrained opacity and transform transitions.
- Reduced-motion users receive the accessible fade route transition and static photo-wall geometry.
- Do not add GSAP, scroll pinning, heavy filter stacks, or layout-property animation.

## Visual System

- Preserve the active warm-paper photo wall: ink, cobalt, coral, lemon, amber, lilac, and pink.
- Use bold editorial type, outlined sticker-like cards, clear reading order, and one dominant focal point per viewport.
- Keep Beyond tokens and behavior isolated from the main portfolio.
- Journal URLs are compatibility redirects to the photo wall; they are not article-rendering routes.

## Content

- Store active album entries as validated frontmatter in `src/content/portfolio/beyond/`.
- Keep optional approved album media under `public/beyond-terminal/album/`; text-first entries must remain valid without an image.
- Extend the existing `BeyondAlbumItem` contract and content validator when adding fields.
- Do not recreate the retired act/card model, journal MDX runtime, or deleted placeholder-asset system.
