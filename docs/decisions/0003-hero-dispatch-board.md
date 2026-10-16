# 0003 — Hero: smaller wordmark plus an interactive dispatch board

- Status: accepted
- Date: 2026-10-16

## Context

The landing view was a full-width "Abhinav" wordmark, a cycling role line, a paragraph and two buttons, with most of the first screen blank. Visitors deciding whether to hire look for role, current position, one proof point and contact within seconds. Strong engineer portfolios either show the work immediately or make the interaction itself the proof of skill. The positioning (decision 0002) leads with forward-deployed engineering and AI agent orchestration.

## Decision

- Keep the seven-letter "Abhinav" wordmark (it also triggers the Beyond portal) at about 52-56% of the viewport width on desktop and about 90% on phones, as the masthead rather than the whole layout.
- Replace the role cycler with a fixed role line, a one-sentence value statement, and "Currently: Database Engineer at Ostrum Tech Limited".
- Add a dispatch board beside the text on desktop (below it on phones): four lanes — Plan, Build, Review, Ship — with ticket slips for the real steps of the orchestration method. Everything is visible without interaction; the board plays through at most twice, then stops; tickets are buttons that work by pointer, touch and keyboard; phones get a compact grid. Under reduced motion it renders complete and static.
- A burgundy floor band carries three short proof points.

## Consequences

- Built from HTML, CSS and inline SVG with local state only (no canvas, WebGL or new dependency; a few kB of JavaScript); the wordmark stays the largest contentful paint.
- The board describes the method, never a shipped AI product or invented metrics.
