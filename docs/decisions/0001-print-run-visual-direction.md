# 0001 — "Print Run" visual direction and palette v2

- Status: accepted
- Date: 2026-10-16

## Context

The matte warm-paper system read as pale and flat. Measured on the home page, about 86% of each desktop screen (82% on mobile) was near-paper colour, and no single screen showed more than 0.45% red. Accents were limited to labels, rules and small marks; section papers differed by only 2-3%; graphics were desktop-only. Two existing styles (a gradient and a blurred shadow in Experience) already broke the matte rules.

## Options

1. Keep the system and only enlarge the existing riso marks.
2. Adopt a louder lead (tangerine) with full-bleed fields.
3. Push the same print idiom much further ("Print Run"): large flat ink fields, two-ink illustrated object plates with overprint and registration offsets, print-like interactions, with a quieter, richer lead ink.

## Decision

Option 3 with a burgundy lead.

| Role | Colour | Notes |
|---|---|---|
| Lead ink | Burgundy `#6A2135` | Fields, large shapes, CTAs; also safe as text on paper (9.6:1); bone text on it 9.0:1 |
| Second field | Glacier `#D7EFFF` | Pale blue field; black-cherry text on it |
| Dark panels | Black Cherry `#351E28` | Replaces espresso `#16130F`; bone text 12.4:1 |
| Secondary inks | Petrol `#1A5D74`, Cornflower `#94B6EF` (text `#25447B`), Love Bird `#C5DE48` (text `#4E5312`), Pale Pink `#F4BEBB` | Section accents and illustration inks |
| Papers | Bone `#F0EEE9`, Linen `#FCF8F2`, Pale Pink, Glacier | Section stocks that visibly differ |
| Text | Ink `#0B1011` | Unchanged |

Rules that change: large flat accent fields are allowed; original illustrations keep their spot colours at rest; screenshots in case studies stay full colour. Rules that stay: no glow, glass, gradients, blurred shadows or `text-shadow`; hard 0-blur print offsets only; every animation has a static reduced-motion path.

## Consequences

- Legacy colour tokens (vermilion, cobalt, ochre, racing green, espresso) become aliases of the new tokens, so component CSS changes stay small.
- Illustrations are hand-authored inline SVG with inks bound to CSS variables (≤ 8 KiB per plate), so they cost no requests and recolour with the tokens.
- Burgundy and black cherry are close in value (1.4:1); dark panels and burgundy fields must not sit edge to edge without a paper or Glacier band between them.
- Performance gates stay: Lighthouse mobile ≥ 0.9, LCP ≤ 2.5 s, CLS < 0.05, now also on the Velo case study.
