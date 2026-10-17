# 0005 — Hero identity: software engineer, with work and own builds kept apart

- Status: accepted
- Date: 2026-10-17
- Supersedes: 0002 (the forward-deployed lead and the "Currently:" line)

## Context

0002 led the site with forward-deployed engineering and showed the current job as a "Currently:" line under it. Read together, the two lines suggested forward-deployed engineering was the job title. It is not: the job is Database Engineer at Ostrum Tech Limited, and forward-deployed-style building is how Abhinav works on personal projects.

## Decision

The hero reads, in order:

1. Wordmark "Abhinav".
2. Identity: "Software engineer".
3. One sentence: "I build products end to end, from the first conversation to release."
4. Two labelled rows, each a link:
   - At work: Database Engineer, Ostrum Tech Limited (to Experience).
   - On my own: Forward deployed builds: Velo, this site, AI-agent workflows (to Work).

Rules that follow from this:

- The job and the own builds never share a line. Ostrum is only ever "Database Engineer".
- "Forward deployed" describes the own builds only. It is never a title or a goal, and it appears in visible copy only in the On my own row. It stays in search keywords.
- No cycling or rolling hero text.
- Page title: "Abhinav Prasad | Software engineer". Structured data keeps `jobTitle` "Database Engineer" at Ostrum Tech Limited.

## Consequences

- The rows print in once after first paint (a hairline draws, labels settle from a slight registration offset). The server render is complete, and reduced motion is static.
- Hover and focus fill a row with burgundy ink, matching the print-press buttons.
- The hero snapshot and the profile and orchestration mobile snapshots were re-baselined.
