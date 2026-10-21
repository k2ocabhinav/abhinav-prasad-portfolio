# 0011 — Supply the WhatsApp destination through the environment

- Status: accepted
- Date: 2026-10-21

## Context

The contact page can offer WhatsApp as an optional channel without storing its destination in tracked source.

## Decision

Build the WhatsApp link from the optional `WHATSAPP_E164` environment variable and keep its value out of source control. If the variable is unset, omit the action. Validate a supplied value as E.164.

## Consequences

- Local and deployment environments can configure the destination independently of the site source.
- Builds without the variable do not publish a WhatsApp action.
