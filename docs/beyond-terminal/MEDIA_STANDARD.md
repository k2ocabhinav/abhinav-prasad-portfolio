# Beyond media standard

The album is a small, curated set of photos. Originals never enter the repository, and no published image carries camera metadata. This page is the contract for `npm run beyond:add` and for the UI that will load the results.

## Inbox workflow

1. Put originals in `beyond-inbox/` next to the repository. Supported inputs are `.jpg`, `.jpeg`, `.png` and `.heic`. The script looks for that folder beside the repo (or its ancestors), and accepts `--inbox <dir>` or `BEYOND_INBOX`.
2. Optionally add a same-name `.txt` sidecar:

```text
title: Office with a view
caption: Shillong, Meghalaya. My workstation had this view for a while.
kind: photo
people: only me
```

`kind` is one of `photo`, `event`, `quote`, `person`, `project`. `people` must be exactly `only me` for an automatic clearance. Anything else, including a missing line, produces `privacy: "needs-consent"`.
3. Run `npm run beyond:add`. Add `--force <slug>` to regenerate one entry after replacing its original.
4. Review the generated draft in `src/content/portfolio/beyond/<slug>.mdx`, rewrite the `alt` text, add tags, and only then change `status` to `published`.

Each run writes `public/beyond-terminal/album/<slug>.<hash8>-<width>.avif` and `.webp`. The hash is taken from the original bytes, so replacing a photo with different content produces new file names and cache-busting is automatic. Reruns skip hashes already present in the album. `--force <slug>` deletes that slug's renditions and rewrites its draft.

The originals stay private. Only the generated renditions and the draft entry are tracked.

## Sizes, formats and caps

| Width | Use | AVIF | WebP | Per-file cap |
|---|---|---|---|---|
| 480 | Grid thumbnail | quality 50, effort 6 | quality 78 | 60 KB |
| 960 | Default `src` and lightbox source on small screens | quality 50, effort 6 | quality 78 | 140 KB |
| 1600 | Lightbox on large screens | quality 50, effort 6 | quality 78 | 280 KB |

- Resize with lanczos3, never upscale, then apply a light sharpen.
- Quality steps down by 5 until the file fits. The floors are AVIF 35 and WebP 60. A file that still exceeds its cap is reported by the script and rejected by `npm run check:content`.
- Every file is converted to sRGB and written without EXIF, GPS, XMP, IPTC or an embedded ICC profile. The script re-reads every written file and reports anything that survived.
- `image.src` points at the 960 WebP. `image.renditions` lists all widths with both paths and their combined byte size.
- `image.placeholder` is a 16px-wide blurred WebP data URI of at most 600 bytes. `image.dominantColor` is the hex colour of the frame.

## Loading rules for the UI

- At most 6 thumbnails may load eagerly at 480. Everything else is lazy.
- The 480 rendition is the grid thumbnail; the 960 rendition is the inline detail view.
- The 1600 rendition is loaded only when the lightbox opens.
- Paint the dominant colour first, then the placeholder data URI, then the real image. Never show an empty box.
- Always set `width`/`height` or the aspect ratio from `image.aspectRatio` to reserve space.

## Repository limit

The album stays in `public/` up to about 60 photos. Past that, move album media to an image host and keep only the metadata and placeholders in the repository. That is an owner decision, not an automatic migration.

## Privacy

- No other person's face is published without their consent. A sidecar that is missing `people:` or does not say `only me` starts as `privacy: "needs-consent"`, and the validator refuses to publish that state.
- The script can report a face count through Apple Vision on macOS. Treat it as a prompt to check the frame, not as consent.
- No exact locations beyond a city. Do not put an address, floor, office name or client site in a title, caption, tag or alt text.
- Screens, badges and whiteboards in frame are checked for readable names and internal identifiers before publishing.

## Validation

`npm run check:content` verifies every rendition file exists, that each fits its width cap, that rendition widths are unique and from the allowed ladder, and that `privacy: "needs-consent"` never appears on a published entry. Draft entries do not render on the Beyond route.
