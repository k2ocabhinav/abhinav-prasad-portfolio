# 0004 — A shorter home page: seven sections

- Status: accepted
- Date: 2026-10-17

## Context

After the Print Run build the home page had twelve sections (hero, services, bridge band, profile, philosophy, experience, works, orchestration, marquee, stack, presence, contact) and measured about 13,350 px on desktop and 17,100 px on a phone. Visitors deciding whether to hire spend one to two minutes on a portfolio. Velo also appeared in six home sections beyond Works.

## Decision

Seven sections, in this order:

1. Hero: wordmark, dispatch board, proof strip.
2. What I do: three service tiles.
3. About: the profile intro and the philosophy panel merged into one block.
4. Experience: compact; key points visible, details expandable.
5. Work: Velo and the portfolio case studies, with the orchestration evidence as a compact strip under them; the print-run poster lives here.
6. Stack: the SVG stack strip and one short ruled list.
7. Contact: includes the presence map, location and availability, email and résumé.

The standalone bridge band and the separate presence and orchestration sections are removed as sections; their content moves as above or into the case-study pages. The marquee remains as a thin band. Velo keeps its full story in Works and its case study, with at most one more mention on the home page.

## Consequences

- Target length: about half of today's, roughly 7-8 desktop screens.
- Navigation, scroll-spy and paper-stock rooms follow the new section list.
- Tests and snapshots are re-baselined once, after this change and the final copy pass.
