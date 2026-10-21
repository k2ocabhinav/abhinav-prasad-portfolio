# Architecture

The site uses the Next.js 16 App Router, React 19, strict TypeScript, CSS Modules, Motion, Lenis, and MDX frontmatter. React Server Components load and assemble page data. Client components handle interaction, motion, and the Beyond room. The Beyond scene uses React Three Fiber and Three.js.

## Routes

| Route | Output |
| --- | --- |
| `/` | Server-rendered homepage sections with content loaded from MDX. |
| `/work/[slug]` | A statically generated case study for each published project detail. Unknown or unpublished slugs return the custom 404. |
| `/work/*.md` | Generated Markdown for each published case study, served as plain text. |
| `/beyond-terminal` | A server-rendered introduction and poster, with a client-rendered room or static fallback. This route is excluded from indexing and the sitemap. |
| `/beyond-terminal/journal` and `/beyond-terminal/journal/[slug]` | Legacy URLs that redirect to `/beyond-terminal`. |
| `/llms.txt` | A generated text summary with links to the homepage, work, and contact details. |
| `/robots.txt` and `/sitemap.xml` | Metadata routes built from the site's indexing configuration and published case studies. |
| 404 | `src/app/not-found.tsx` renders the site not-found page. |

## Directory map

### `src/`

- `src/app/` — App Router layouts, pages, metadata, and route handlers.
- `src/app/beyond-terminal/` — Beyond route layout, page, and styles.
- `src/app/beyond-terminal/fonts/` — Self-hosted fonts used by Beyond.
- `src/app/beyond-terminal/journal/` — Redirects for the former journal archive and entries.
- `src/app/beyond-terminal/journal/[slug]/` — Redirect for a former journal entry URL.
- `src/app/fonts/` — Self-hosted homepage display font files.
- `src/app/llms.txt/` — Static text route handler for `/llms.txt`.
- `src/app/work/` — Work route handlers and the case-study route.
- `src/app/work/[slug]/` — Statically generated case-study page.
- `src/app/work/portfolio-platform.md/` — Markdown response for the portfolio-platform case study.
- `src/app/work/velo.md/` — Markdown response for the Velo case study.
- `src/components/` — Page composition and reusable interface components.
- `src/components/art/` — Hand-authored SVG illustrations and print marks.
- `src/components/art/stack-icons/` — Semantic SVG icons used by stack entries.
- `src/components/beyond/` — Beyond room scene, fallback, and moment components.
- `src/components/beyond/room/` — Room state, scene, and moment layers.
- `src/components/beyond/room/moments/` — Interactive postcard, photo, and terminal moments.
- `src/components/beyond/room/scene/` — Three.js room, camera, materials, and scene parts.
- `src/components/beyond/shell/` — Room loading, poster, fallback deck, and experience shell.
- `src/components/beyond-terminal/` — Portal navigation, transitions, and Beyond route chrome.
- `src/components/landing/` — Homepage hero, press-sheet light, and portal trigger.
- `src/components/layout/` — Site navigation, footer, backdrop, and persistent controls.
- `src/components/layout/navigation/` — Navigation and marquee tracking hooks.
- `src/components/providers/` — Motion, scrolling, and portal provider boundaries.
- `src/components/sections/` — Homepage sections and case-study page composition.
- `src/components/sections/about/` — Service tile components.
- `src/components/sections/contact/` — Email and local-time controls.
- `src/components/sections/project-detail/` — Case-study storyboard interactions and visuals.
- `src/components/ui/` — Shared controls, section wrappers, and scroll utilities.
- `src/content/` — Editable MDX content.
- `src/content/portfolio/` — Portfolio profile and content collections.
- `src/content/portfolio/beyond/` — Beyond album entries.
- `src/content/portfolio/chronicle/` — Experience entries.
- `src/content/portfolio/projects/` — Project cards and case-study details.
- `src/content/portfolio/services/` — Service descriptions.
- `src/content/portfolio/stack/` — Evidence-scoped skill groups.
- `src/data/` — Navigation data.
- `src/hooks/` — Pointer, reduced-motion, and interaction hooks.
- `src/lib/` — Content entry point, shared models, metadata, and utilities.
- `src/lib/content/` — Typed loaders for each MDX collection.
- `src/types/` — Shared TypeScript content and component types.

### `scripts/`

- `scripts/` — Content and asset validation, capture, and media tooling.
- `scripts/beyond/` — Beyond photo processing, draft generation, poster, and performance tools.
- `scripts/hero/` — Hero capture and measurement utilities.

### Key files

- `src/app/layout.tsx` — Root metadata, fonts, and global styles.
- `src/app/page.tsx` — Server entry point for the homepage and structured data.
- `src/app/work/[slug]/page.tsx` — Published case-study lookup, metadata, and static params.
- `src/lib/portfolioContent.ts` — Server-only content API used by route components.
- `src/lib/content/` — MDX frontmatter readers and typed collection loaders.
- `src/lib/portfolioSchema.mjs` — Shared content field rules, enumerations, and constants.
- `src/lib/structuredData.ts` — JSON-LD builders for the homepage and case studies.
- `src/lib/projectMarkdown.ts` — Case-study Markdown response generation.
- `scripts/check-portfolio-content.mjs` — Build-time validation of MDX fields, references, and content rules.
- `scripts/check-public-assets.mjs` — Validation of local public asset references and image metadata.
- `scripts/capture-portfolio-assets.mjs` — Deterministic portfolio screenshots and social images with content-hashed filenames.
- `scripts/beyond/add-media.mjs` — Beyond album image processing and draft creation.
- `next.config.ts` — Image formats and sizes, HTTP headers, CSP, and cache policy.
- `playwright.config.ts` — Playwright projects and local server settings.
- `lighthouserc.json` — Lighthouse CI routes and assertions.
- `.github/dependabot.yml` — Weekly npm dependency update schedule.

## Content and data flow

1. MDX frontmatter under `src/content/portfolio/` is the editable source for profile, experience, projects, services, stack, and Beyond album data.
2. Typed loaders under `src/lib/content/` parse frontmatter and use shared field rules and enumerations from `src/lib/portfolioSchema.mjs`. `src/lib/portfolioContent.ts` exposes these loaders to server code.
3. `scripts/check-portfolio-content.mjs` imports the same schema and validates the content and public asset references. `npm run build` runs this preflight before `next build`.
4. App Router server components load content and generate metadata, structured data, and static route params. They pass typed props into interactive client components where needed.
5. Collection items marked `status: "draft"` stay out of public lists and generated case-study routes. Published case-study details supply both the page and its Markdown response.

The server-only content loader reads `WHATSAPP_E164`, validates its format, and creates the WhatsApp link on the server. The raw environment value is not read by browser code; an unset value omits the WhatsApp action.

## Rendering and performance

- The homepage and published case-study routes are rendered at build time. `/llms.txt` and the Markdown case-study handlers are static outputs. `robots.txt` and `sitemap.xml` use Next.js metadata routes.
- Server components assemble the page. Client components are used for navigation, motion, controls, and other interactive behavior. The shared experience provider is dynamically imported.
- Motion uses `LazyMotion` with `domAnimation` and `MotionConfig` with the user's reduced-motion preference. Shared animation definitions live in `src/lib/animations.ts`; `FlipRevealText`, `RisoMark`, and `useGatedScrollProgress` are reusable motion primitives.
- Scroll-linked movement favors compositor-friendly transforms and opacity. The backdrop selects a paper stock at the viewport midpoint and transitions its background color.
- Lenis is initialized only for fine pointers and is skipped when reduced motion is requested. Touch-first devices keep native scrolling.
- Scroll progress trackers run only while their target is near the viewport. The `html[data-scrolling]` flag suppresses easing on selected hover states while the page moves.
- The hero light is scoped to the press sheet in `src/components/landing/SheetLight.tsx`; pointer and scroll updates do not create global light variables.
- Next Image optimization serves AVIF and WebP variants using the device widths 360, 640, 750, 828, 1080, 1200, 1440, and 1920 pixels, plus image widths 64, 96, 128, 256, and 384 pixels from `next.config.ts`. Generated portfolio captures use content hashes. The Beyond album pipeline writes hashed AVIF and WebP renditions at 480, 960, and 1600 pixels where the source permits.
- Beyond's Three.js room is split into dynamic client chunks. A browser capability gate selects the room or fallback based on reduced motion, data-saving and device capabilities, and WebGL2 support. The canvas runs only while visible and the document is active; a server-rendered poster remains the first-frame surface.

## Testing and checks

Playwright's `desktop-chromium` project runs the general suite. The `portfolio-responsive.spec.ts` suite also runs in `mobile-webkit-narrow`, `mobile-safari`, `mobile-chrome`, `mobile-safari-landscape`, `tablet-safari`, and `tablet-safari-landscape` projects.

The suites cover responsive layouts, keyboard interactions, selected accessibility checks with axe, reduced-motion paths, security headers and CSP, server-rendered content without JavaScript, content validation errors, SEO and metadata, public image references, and the Beyond capability and fallback harness. `npm run test:lighthouse` builds a production site and checks performance and SEO for the homepage and both case studies.

Common commands:

```sh
npm run check:content
npm run typecheck
npm run lint
npm run check:dead
npm run check:assets
npm run check:security
npm run build
npm run test:e2e
npm run test:e2e:responsive
npm run test:e2e:prod
npm run test:lighthouse
npm run verify
```

`npm run verify` runs the content, type, lint, dead-code, asset, security, build, Playwright, and Lighthouse gates.

## Security and public assets

Production responses set a Content Security Policy and security headers for MIME sniffing, referrers, browser permissions, framing, and cross-origin opener isolation. `X-Powered-By` is disabled. Static hashed assets receive immutable caching; HTML has a short browser cache lifetime and a longer CDN cache lifetime.

There are no general-purpose API endpoints or server-side form submissions. The GET route handlers generate `/llms.txt` and the published case-study Markdown files. The Beyond terminal accepts commands locally in the browser. The CSP limits resources to the same origin and disallows plugins and framing.

Content validation requires local public asset paths and rejects missing files. The asset check reports missing or unreferenced files, image metadata, and tracked text matching a raw mobile-number pattern. Beyond's media processor removes metadata before writing album renditions. Dependabot checks npm dependencies weekly.

## Contribution conventions

Use commit subjects in the form `<type>(<scope>): <description>`. Keep MDX schemas and the shared schema in sync; run the content preflight when editing portfolio content. New projects start as drafts and remain hidden until their content and assets are ready.

To add a case study, create `src/content/portfolio/projects/<slug>.mdx` using an existing project entry as the schema example. Add referenced images under `public/projects/<slug>/` and use local paths. Add `src/app/work/<slug>.md/route.ts` to serve its Markdown response through `getProjectMarkdownResponse`. Set the project to published and enable its detail only when the page content is complete; the published detail is then included in static params and the sitemap. Use `npm run capture:portfolio` when regenerating the portfolio case-study captures, then run `npm run check:content` and `npm run check:assets`.

To add a Beyond photo, place source images in a local inbox outside the repository and run `npm run beyond:add` (or pass `-- --inbox <directory>`). The script writes hashed AVIF/WebP renditions under `public/beyond-terminal/album/` and an MDX draft under `src/content/portfolio/beyond/`. Review the generated draft, its consent state, caption, and alt text before publishing it.
