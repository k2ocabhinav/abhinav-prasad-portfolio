# 0006 — Six sections for one clear profile

- Status: accepted
- Date: 2026-10-20
- Supersedes: the seven-section home structure in 0004

## Decision

The homepage presents one clear profile: Abhinav works on database and backend engineering in his job, and builds products from backend to interface in his independent projects. The order answers a visitor's next question without adding a separate story section or extended narrative copy.

The six sections are:

1. Hero
2. What I do, including the profile introduction and service evidence
3. Experience
4. Work, with How I work below the project cards
5. Stack
6. Contact

The marquee remains a supporting band. Location and relocation wording stay in Contact. The résumé action remains visible there.

## Content ownership and synchronization

- `profile.mdx` owns identity, hero copy, the short What I do introduction, location, contact, SEO and structured-data topics.
- `services/*.mdx` owns the three service summaries and their evidence tags.
- `chronicle/*.mdx` owns employment facts, experience summaries, expanded workstreams and related screenshots.
- `projects/*.mdx` owns project facts; homepage cards and case-study introductions stay aligned with those entries.
- `stack/*.mdx` owns technology groups and where each group applies.
- `profile.mdx` owns the homepage method copy; the section presents the same approved method without adding counts or claims.

When a fact changes, update its owning content entry and any required presentation of that fact together. Avoid maintaining separate copies of the same claim in components, metadata and content files.
