# 0013 — Put content digests in generated image names

- Status: accepted
- Date: 2026-10-21

## Context

Long-lived image caching is safe when a changed asset receives a different URL.

## Decision

Include a content digest in generated portfolio captures, share images, Beyond posters, and album renditions. Apply immutable caching to the generated assets covered by the explicit cache rules.

## Consequences

- Changed image bytes produce a new URL and cache key.
- HTML and un-hashed assets retain revalidation or bounded caching behavior.
