# 0002 — Lead with forward-deployed engineering; backend and data as proof

- Status: accepted
- Date: 2026-10-16

## Context

The site introduced its owner as a backend/database engineer, and MySQL depth repeated across the hero, about, services, experience and stack. The owner wants to be seen as a forward deployed engineer (FDE) with AI-orchestration skills. Market data from October 2026: FDE postings are growing fast and are mostly sourced from 3-7-year backend engineers; most ask for customer-facing work and production coding, and only about a quarter require LLM development. Hiring managers value one deep, real project with a written account of what broke and how it was fixed over many demos.

## Options

1. Keep "Backend Software Engineer" as the identity.
2. Lead with "AI Engineer".
3. Lead with "Forward Deployed Engineer" as the target identity, with AI agent orchestration as the differentiator and backend/data delivery as the proof.

## Decision

Option 3.

- Landing view: name, "Forward Deployed Engineer", a one-line value statement about turning operational needs into reliable software with backend engineering and human-reviewed AI agent workflows, and a visible "Currently: <official title> at Ostrum Tech Limited" line.
- New proof section on how the owner orchestrates AI coding agents (planning, isolated executors, rated runs, independent review, browser rehearsals), using only facts from the owner's own projects.
- Velo stays the flagship system, labelled a pre-launch working demo.
- Database engineering appears as supporting proof in Experience and Stack, not as the headline.
- "AI Engineer", "Applied AI Engineer" and "AI Agent Engineer" are search keywords only, not claimed titles, until there is a shipped AI product with evaluations.
- The official job title and employer are never hidden or changed; structured data keeps them as `jobTitle`/`worksFor`.

## Consequences

- Copy across profile, services, experience emphasis and stack changes; experience facts do not.
- The current title shown on the site must match the owner's official title ("Software Engineer at Ostrum Tech Limited", confirmed by the owner on 2026-10-16; database engineering is presented as the specialty).
- Biggest remaining gap for the FDE story: a public, deployed demo and a written debugging case study.
