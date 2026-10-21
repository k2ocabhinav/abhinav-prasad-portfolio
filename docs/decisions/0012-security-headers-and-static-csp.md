# 0012 — Apply security headers with a static-compatible CSP

- Status: accepted
- Date: 2026-10-21

## Context

The site needs browser security headers while keeping its pages statically rendered.

## Decision

Apply content-type, referrer, permissions, opener, and frame protections across routes. Add a production Content Security Policy with same-origin sources and the inline script and style allowances required by the current output. Do not generate nonces, so page rendering remains static.

## Consequences

- The policy and headers are configured in one place in `next.config.ts`.
- Production responses receive the CSP; development remains available without it.
